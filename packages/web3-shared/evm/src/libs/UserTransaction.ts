import { BigNumber } from 'bignumber.js'
import { isUndefined, omitBy } from 'lodash-es'
import type Web3 from 'web3'
import * as ABICoder from 'web3-eth-abi'
import { AbiItem, hexToBytes, keccak256, padLeft, toHex, toNumber } from 'web3-utils'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { multipliedBy, plus, toFixed } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import EntryPointABI from '@masknet/web3-contracts/abis/EntryPoint.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { EntryPoint } from '@masknet/web3-contracts/types/EntryPoint.js'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import {
    createContract,
    getZeroAddress,
    isZeroString,
    isEmptyHex,
    isZeroAddress,
    formatEthereumAddress,
    addGasMargin,
} from '../helpers/index.js'
import { getSmartPayConstants } from '../constants/index.js'
import type { Signer } from './Signer.js'

const USER_OP_TYPE = {
    userOp: {
        sender: 'address',
        nonce: 'uint256',
        initCode: 'bytes',
        callData: 'bytes',
        callGas: 'uint256',
        verificationGas: 'uint256',
        preVerificationGas: 'uint256',
        maxFeePerGas: 'uint256',
        maxPriorityFeePerGas: 'uint256',
        paymaster: 'address',
        paymasterData: 'bytes',
        signature: 'bytes',
    },
}

const DEFAULT_USER_OPERATION: Required<UserOperation> = {
    sender: getZeroAddress(),
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGas: '21000',
    // default verification gas. will add create2 cost (3200 + 200 * length) if initCode exists
    verificationGas: '100000',
    // should also cover calldata cost.
    preVerificationGas: '21000',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '1000000000',
    paymaster: getZeroAddress(),
    paymasterData: '0x',
    signature: '0x',
}

const CALL_WALLET_TYPE: AbiItem = {
    name: 'execFromEntryPoint',
    type: 'function',
    inputs: [
        {
            internalType: 'address',
            name: 'dest',
            type: 'address',
        },
        {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
        },
        {
            internalType: 'bytes',
            name: 'func',
            type: 'bytes',
        },
    ],
}

const coder = ABICoder as unknown as ABICoder.AbiCoder

export interface Options {
    paymentToken?: string
}

/**
 * The wrapped UserOperation helper.
 * Learn more: https://github.com/eth-infinitism/account-abstraction/blob/develop/test/UserOp.ts
 */
export class UserTransaction {
    /**
     * @deprecated Don't new UserTransaction()
     * Use UserTransaction.fromTransaction() or UserTransaction.fromUserOperation() stead.
     * They ensure to create of a valid user operation.
     *
     * @param chainId
     * @param entryPoint
     * @param userOperation
     */
    constructor(
        private chainId: ChainId,
        private entryPoint: string,
        private userOperation: UserOperation,
        private options?: Options,
    ) {}

    get paymentToken() {
        return this.options?.paymentToken
    }

    get initCode() {
        return this.userOperation.initCode
    }

    get nonce() {
        return this.userOperation.nonce ?? 0
    }

    get hasPaymaster() {
        return !!(this.userOperation.paymaster && !isZeroAddress(this.userOperation.paymaster))
    }

    /**
     * Pack everything without signature
     */
    get pack() {
        const encoded = coder.encodeParameter(USER_OP_TYPE, {
            ...this.userOperation,
            signature: '0x',
        })
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    /**
     * Pack everything include signature
     */
    get packAll() {
        const encoded = coder.encodeParameter(USER_OP_TYPE, this.userOperation)
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get hash() {
        return keccak256(this.pack)
    }

    get requestId() {
        return keccak256(
            coder.encodeParameters(['bytes32', 'address', 'uint256'], [this.hash, this.entryPoint, this.chainId]),
        )
    }

    get gas() {
        return toFixed(plus(this.userOperation.callGas ?? 0, this.userOperation.preVerificationGas ?? 0))
    }

    get operation() {
        return this.userOperation
    }

    async fillTransaction(web3: Web3) {
        const { sender, nonce, callData, maxFeePerGas, maxPriorityFeePerGas } = this.userOperation

        // fill nonce
        if (sender && (typeof nonce === 'undefined' || nonce === 0)) {
            const walletContract = createContract<Wallet>(web3, sender, WalletABI as AbiItem[])
            if (!walletContract) throw new Error('Failed to create wallet contract.')
            try {
                const nonce = await walletContract.methods.nonce().call()
                this.userOperation.nonce = toNumber(nonce)
            } catch (error) {
                this.userOperation.nonce = 0
            }
        }

        try {
            if (isEmptyHex(callData)) throw new Error('Invalid call data.')
            const transaction = UserTransaction.toTransaction(this.chainId, this.userOperation)
            if (!transaction.from || !transaction.to) throw new Error('Invalid transaction.')
            const walletContract = createContract<Wallet>(web3, sender, WalletABI as AbiItem[])
            if (!walletContract) throw new Error('Failed to create wallet contract.')
            const result = await walletContract?.methods
                .exec(transaction.to, transaction.value ?? '0', transaction.data ?? '0x')
                .estimateGas()

            this.userOperation.callGas = toHex(result)
        } catch (error) {
            this.userOperation.callGas = toFixed(addGasMargin(DEFAULT_USER_OPERATION.callGas, 5000))
        }

        if (isZeroString(maxFeePerGas)) {
            const block = await web3.eth.getBlock('latest')
            this.userOperation.maxFeePerGas = toFixed(
                new BigNumber(block.baseFeePerGas ?? 0).plus(
                    maxPriorityFeePerGas ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas,
                ),
            )
        }
        if (isZeroString(maxPriorityFeePerGas)) {
            this.userOperation.maxPriorityFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
        }

        return this
    }

    async fillUserOperation(web3: Web3, overrides?: Required<Pick<UserOperation, 'initCode' | 'nonce'>>) {
        // from overrides
        if (overrides) {
            this.userOperation.nonce = overrides.nonce
            this.userOperation.initCode = overrides.initCode
        }

        const {
            initCode,
            nonce,
            sender,
            callData,
            verificationGas,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymaster,
        } = this.userOperation

        // add sender
        if (!isEmptyHex(initCode) && !sender) {
            const entryPointContract = createContract<EntryPoint>(web3, this.entryPoint, EntryPointABI as AbiItem[])
            if (!entryPointContract) throw new Error('Failed to create entry point contract.')
            this.userOperation.sender = await entryPointContract.methods.getSenderAddress(initCode, nonce).call()
        }

        // add more verification gas
        if (!isEmptyHex(initCode)) {
            this.userOperation.verificationGas = toFixed(
                new BigNumber(DEFAULT_USER_OPERATION.verificationGas).plus(32000 + (200 * initCode.length) / 2),
            )
        } else {
            this.userOperation.verificationGas = toFixed(DEFAULT_USER_OPERATION.verificationGas)
        }

        // caution: the creator needs to set the latest index of the contract account.
        // otherwise, always treat the operation to create the initial account.
        if (this.userOperation.sender && typeof overrides === 'undefined' && nonce === 0) {
            const walletContract = createContract<Wallet>(web3, this.userOperation.sender, WalletABI as AbiItem[])
            if (!walletContract) throw new Error('Failed to create wallet contract.')
            try {
                const nonce_ = await walletContract.methods.nonce().call()
                this.userOperation.nonce = toNumber(nonce_)
            } catch (error) {
                this.userOperation.nonce = 0
            }
        }

        try {
            if (isEmptyHex(callData)) throw new Error('Invalid call data.')
            const estimatedGas = await web3.eth.estimateGas({
                from: this.entryPoint,
                to: sender,
                data: callData,
            })
            this.userOperation.callGas = toFixed(addGasMargin(estimatedGas * 2))
        } catch (error) {
            this.userOperation.callGas = toFixed(addGasMargin(DEFAULT_USER_OPERATION.callGas, 5000))
        }

        if (isZeroString(maxFeePerGas)) {
            const block = await web3.eth.getBlock('latest')
            this.userOperation.maxFeePerGas = toFixed(
                new BigNumber(block.baseFeePerGas ?? 0).plus(
                    maxPriorityFeePerGas ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas,
                ),
            )
        }
        if (isZeroString(maxPriorityFeePerGas)) {
            this.userOperation.maxPriorityFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
        }
        if (isZeroString(verificationGas)) {
            this.userOperation.verificationGas = toFixed(DEFAULT_USER_OPERATION.verificationGas)
        }
        if (isZeroString(preVerificationGas)) {
            this.userOperation.preVerificationGas = toFixed(
                Math.max(
                    hexToBytes(this.packAll)
                        .map<number>((x) => (x === 0 ? 4 : 16))
                        .reduce((sum, x) => sum + x),
                    Number.parseInt(DEFAULT_USER_OPERATION.preVerificationGas, 10),
                ),
            )
        }
        if (!paymaster || isZeroAddress(paymaster)) {
            const { PAYMASTER_CONTRACT_ADDRESS } = getSmartPayConstants(this.chainId)
            if (!PAYMASTER_CONTRACT_ADDRESS) throw new Error('No paymaster address.')
            if (!this.paymentToken) throw new Error('No payment token address.')

            this.userOperation.paymaster = PAYMASTER_CONTRACT_ADDRESS
            this.userOperation.paymasterData = padLeft(this.paymentToken, 64)
        }

        return this
    }

    estimateTransaction() {
        const { callGas = DEFAULT_USER_OPERATION.callGas } = this.userOperation
        return toFixed(multipliedBy(callGas, 2))
    }

    estimateUserOperation() {
        const { preVerificationGas = '0', verificationGas = '0', callGas = '0' } = this.userOperation
        return toFixed(multipliedBy(plus(preVerificationGas, plus(verificationGas, callGas)), 2))
    }

    async signTransaction(web3: Web3, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string> {
        const transaction = UserTransaction.toTransaction(this.chainId, this.userOperation)
        if (!transaction.from || !transaction.to) throw new Error('Invalid transaction.')
        const walletContract = createContract<Wallet>(web3, transaction.from, WalletABI as AbiItem[])
        if (!walletContract) throw new Error('Failed to create wallet contract.')

        return signer.signTransaction(
            omitBy(
                {
                    ...transaction,
                    to: transaction.from,
                    nonce: await web3.eth.getTransactionCount(transaction.from),
                    data: walletContract?.methods
                        .exec(transaction.to, transaction.value ?? '0', transaction.data ?? '0x')
                        .encodeABI(),
                },
                isUndefined,
            ),
        )
    }

    async signUserOperation(signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<UserOperation> {
        const { nonce, callGas, verificationGas, preVerificationGas, maxFeePerGas, maxPriorityFeePerGas } =
            this.userOperation
        return {
            ...this.userOperation,
            sender: formatEthereumAddress(this.userOperation.sender),
            nonce,
            callGas: callGas ? toFixed(callGas) : '0',
            verificationGas: verificationGas ? toFixed(verificationGas) : '0',
            preVerificationGas: preVerificationGas ? toFixed(preVerificationGas) : '0',
            maxFeePerGas: maxFeePerGas ? toFixed(maxFeePerGas) : '0',
            maxPriorityFeePerGas: maxPriorityFeePerGas ? toFixed(maxPriorityFeePerGas) : '0',
            signature: await signer.signMessage(this.requestId),
        }
    }

    static fromTransaction(
        chainId: ChainId,
        entryPoint: string,
        transaction: Transaction,
        options?: Options,
    ): UserTransaction {
        return new UserTransaction(chainId, entryPoint, UserTransaction.toUserOperation(transaction), {
            paymentToken: transaction.gasCurrency,
            ...options,
        })
    }

    static fromUserOperation(
        chainId: ChainId,
        entryPoint: string,
        userOperation: UserOperation,
        options?: Options,
    ): UserTransaction {
        return new UserTransaction(
            chainId,
            entryPoint,
            {
                ...DEFAULT_USER_OPERATION,
                ...userOperation,
            },
            options,
        )
    }

    static toUserOperation(transaction: Transaction): UserOperation {
        const { from, to, nonce = 0, value = '0', data = '0x' } = transaction
        if (!from) throw new Error('No sender address.')
        if (!to) throw new Error('No destination address.')
        return {
            ...DEFAULT_USER_OPERATION,
            sender: formatEthereumAddress(from),
            nonce: toNumber(nonce as number),
            callData: coder.encodeFunctionCall(CALL_WALLET_TYPE, [to, value, data]),
            signature: '0x',
        }
    }

    static toTransaction(chainId: ChainId, userOperation: UserOperation): Transaction {
        const parameters = !isEmptyHex(userOperation.callData)
            ? (coder.decodeParameters(CALL_WALLET_TYPE.inputs ?? [], userOperation.callData.slice(10)) as {
                  dest: string
                  value: string
                  func: string
              })
            : undefined

        return {
            chainId,
            from: userOperation.sender,
            to: parameters?.dest,
            value: toHex(parameters?.value ?? '0'),
            gas: userOperation.callGas,
            maxFeePerGas: userOperation.maxFeePerGas,
            maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
            nonce: toNumber(userOperation.nonce ?? '0'),
            data: parameters?.func ?? '0x',
        }
    }
}
