import { BigNumber } from 'bignumber.js'
import { isUndefined, omitBy } from 'lodash-es'
import type Web3 from 'web3'
import * as ABICoder from 'web3-eth-abi'
import { AbiItem, bytesToHex, hexToBytes, keccak256, padLeft, toNumber } from 'web3-utils'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { plus, toFixed } from '@masknet/web3-shared-base'
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
        private options?: {
            paymentToken?: string
        },
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

    /**
     * Fill up an incomplete user operation.
     */
    async fill(web3: Web3, overrides?: Required<Pick<UserOperation, 'initCode' | 'nonce'>>) {
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

        if (!isEmptyHex(initCode)) {
            if (!sender) {
                const entryPointContract = createContract<EntryPoint>(web3, this.entryPoint, EntryPointABI as AbiItem[])
                if (!entryPointContract) throw new Error('Failed to create entry point contract.')
                this.userOperation.sender = await entryPointContract.methods.getSenderAddress(initCode, nonce).call()
            }

            // add more verification gas
            this.userOperation.verificationGas = toFixed(
                new BigNumber(DEFAULT_USER_OPERATION.verificationGas).plus(32000 + (200 * initCode.length) / 2),
            )
        }

        // caution: the creator needs to set the latest index of the contract account.
        // otherwise, always treat the operation to create the initial account.
        if (typeof overrides === 'undefined' && nonce === 0) {
            const walletContract = createContract<Wallet>(web3, this.userOperation.sender, WalletABI as AbiItem[])
            if (!walletContract) throw new Error('Failed to create wallet contract.')
            try {
                const nonce_ = await walletContract.methods.nonce().call()
                this.userOperation.nonce = toNumber(nonce_)
            } catch (error) {
                this.userOperation.nonce = 0
            }
        }

        if (!isEmptyHex(callData)) {
            const estimatedGas = await web3.eth.estimateGas({
                from: this.entryPoint,
                to: sender,
                data: callData,
            })
            this.userOperation.callGas = toFixed(addGasMargin(estimatedGas, 5000))
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

    /**
     * Estimate a raw transaction.
     */
    estimate(web3: Web3) {
        const transaction = this.toTransaction()
        if (!transaction.from || !transaction.to) throw new Error('Invalid transaction.')
        const walletContract = createContract<Wallet>(web3, transaction.from, WalletABI as AbiItem[])
        if (!walletContract) throw new Error('Failed to create wallet contract.')

        return walletContract?.methods
            .exec(transaction.to, transaction.value ?? '0', transaction.data ?? '0x')
            .estimateGas()
    }

    toTransaction(): Transaction {
        return UserTransaction.toTransaction(this.chainId, this.userOperation)
    }

    async toRawTransaction(web3: Web3, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string> {
        const transaction = this.toTransaction()
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

    async toUserOperation(signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<UserOperation> {
        const { nonce, callGas, verificationGas, preVerificationGas, maxFeePerGas, maxPriorityFeePerGas, signature } =
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

    static async fromTransaction(
        chainId: ChainId,
        web3: Web3,
        entryPoint: string,
        transaction: Transaction,
        gasCurrency?: string,
    ): Promise<UserTransaction> {
        const { from, to, nonce = 0, value = '0', data = '0x' } = transaction
        if (!from) throw new Error('No sender address.')
        if (!to) throw new Error('No destination address.')

        return UserTransaction.fromUserOperation(
            chainId,
            web3,
            entryPoint,
            {
                ...DEFAULT_USER_OPERATION,
                sender: formatEthereumAddress(from),
                nonce: toNumber(nonce as number),
                callData: coder.encodeFunctionCall(CALL_WALLET_TYPE, [to, value, data]),
                signature: '0x',
            },
            {
                paymentToken: gasCurrency,
            },
        )
    }

    static async fromUserOperation(
        chainId: ChainId,
        web3: Web3,
        entryPoint: string,
        userOperation: UserOperation,
        options?: {
            paymentToken?: string
        },
    ): Promise<UserTransaction> {
        const userTransaction = new UserTransaction(
            chainId,
            entryPoint,
            {
                ...DEFAULT_USER_OPERATION,
                ...userOperation,
            },
            options,
        )
        return userTransaction.fill(web3)
    }

    static toTransaction(chainId: ChainId, userOperation: UserOperation): Transaction {
        const callBytes = userOperation.callData ? hexToBytes(userOperation.callData) : []

        return {
            from: userOperation.sender,
            to: bytesToHex(callBytes.slice(12, 36)),
            value: bytesToHex(callBytes.slice(36, 68)),
            gas: userOperation.callGas,
            maxFeePerGas: userOperation.maxFeePerGas,
            maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
            nonce: toNumber(userOperation.nonce ?? '0'),
            data: bytesToHex(callBytes.slice(68)),
            chainId,
        }
    }
}
