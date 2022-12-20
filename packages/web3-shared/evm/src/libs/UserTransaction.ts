import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import * as ABICoder from 'web3-eth-abi'
import { AbiItem, bytesToHex, hexToBytes, keccak256, padLeft, toNumber } from 'web3-utils'
import { toFixed } from '@masknet/web3-shared-base'
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
} from '../helpers/index.js'
import { getSmartPayConstants } from '../index.js'

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

const DEFAULT_USER_OPERATION: Required<UserOperation> = {
    sender: getZeroAddress(),
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGas: '0',
    // default verification gas. will add create2 cost (3200 + 200 * length) if initCode exists
    verificationGas: '100000',
    // should also cover calldata cost.
    preVerificationGas: '0',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '1000000000',
    paymaster: getZeroAddress(),
    paymasterData: '0x',
    signature: '0x',
}

// TODO: replace to sdk
const web3 = new Web3('https://polygon-mumbai.infura.io/v3/d65858b010d249419cf8687eca12b094')
const coder = ABICoder as unknown as ABICoder.AbiCoder

/**
 * The wrapped UserOperation helper.
 * Learn more: https://github.com/eth-infinitism/account-abstraction/blob/develop/test/UserOp.ts
 */
export class UserTransaction {
    private get entryPointContract() {
        return createContract<EntryPoint>(web3, this.entryPoint, EntryPointABI as AbiItem[])
    }

    private get walletContract() {
        return createContract<Wallet>(web3, this.userOperation.sender, WalletABI as AbiItem[])
    }

    /**
     * @deprecated Don't new UserTransaction()
     * Use UserTransaction.fromTransaction() or UserTransaction.fromUserOperation() stead.
     * They ensure to create of a valid user operation.
     *
     * @param chainId
     * @param entryPoint
     * @param userOperation
     */
    constructor(private chainId: ChainId, private entryPoint: string, private userOperation: UserOperation) {}

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

    async sign(signer: (message: string, userOperation: UserOperation) => Promise<string>) {
        this.userOperation.signature = await signer(this.requestId, this.toUserOperation())
        return this
    }

    async fill(overrides?: Required<Pick<UserOperation, 'initCode' | 'nonce'>>) {
        // from overrides
        if (overrides) {
            this.userOperation.nonce = overrides.nonce
            this.userOperation.initCode = overrides.initCode
        }

        const {
            initCode,
            nonce,
            sender,
            callGas,
            callData,
            verificationGas,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymaster,
        } = this.userOperation

        if (!isEmptyHex(initCode)) {
            // caution: the creator needs to set the latest index of the contract account.
            // otherwise, always treat the operation to create the initial account.
            if (typeof nonce === 'undefined') this.userOperation.nonce = 0
            if (!sender) {
                if (!this.entryPointContract) throw new Error('Failed to create entry point contract.')
                this.userOperation.sender = await this.entryPointContract.methods
                    .getSenderAddress(initCode, nonce)
                    .call()
            }

            // add more verification gas
            this.userOperation.verificationGas = toFixed(
                new BigNumber(DEFAULT_USER_OPERATION.verificationGas).plus(32000 + (200 * initCode.length) / 2),
            )
        }

        if (typeof this.userOperation.nonce === 'undefined') {
            if (!this.walletContract) throw new Error('Failed to create wallet contract.')
            this.userOperation.nonce = toNumber(await this.walletContract.methods.nonce().call())
        }

        if (isZeroString(callGas) && !isEmptyHex(callData)) {
            this.userOperation.callGas = toFixed(
                await web3.eth.estimateGas({
                    from: this.entryPoint,
                    to: sender,
                    data: callData,
                }),
            )
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
                hexToBytes(this.packAll)
                    .map<number>((x) => (x === 0 ? 4 : 16))
                    .reduce((sum, x) => sum + x),
            )
        }
        if (!paymaster || isZeroAddress(paymaster)) {
            const { PAYMASTER_CONTRACT_ADDRESS, PAYMENT_TOKEN_ADDRESS } = getSmartPayConstants(this.chainId)
            if (!PAYMASTER_CONTRACT_ADDRESS) throw new Error('No paymaster address.')
            if (!PAYMENT_TOKEN_ADDRESS) throw new Error('No payment token address.')

            this.userOperation.paymaster = PAYMASTER_CONTRACT_ADDRESS
            this.userOperation.paymasterData = padLeft(PAYMENT_TOKEN_ADDRESS, 32)
        }

        return this
    }

    toTransaction(): Transaction {
        const callBytes = this.userOperation.callData ? hexToBytes(this.userOperation.callData) : []

        return {
            from: this.userOperation.sender,
            to: bytesToHex(callBytes.slice(12, 36)),
            value: bytesToHex(callBytes.slice(36, 68)),
            gas: this.userOperation.callGas,
            maxFeePerGas: this.userOperation.maxFeePerGas,
            maxPriorityFeePerGas: this.userOperation.maxPriorityFeePerGas,
            nonce: toNumber(this.userOperation.nonce ?? '0'),
            data: bytesToHex(callBytes.slice(68)),
            chainId: this.chainId,
        }
    }

    toUserOperation(): UserOperation {
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
            signature,
        }
    }

    static async fromTransaction(
        chainId: ChainId,
        entryPoint: string,
        transaction: Transaction,
    ): Promise<UserTransaction> {
        const { from, to, nonce = 0, value = '0', data = '0x' } = transaction
        if (!from) throw new Error('No sender address.')
        if (!to) throw new Error('No destination address.')

        return UserTransaction.fromUserOperation(chainId, entryPoint, {
            ...DEFAULT_USER_OPERATION,
            sender: from,
            nonce: toNumber(nonce as number),
            callData: coder.encodeFunctionCall(CALL_WALLET_TYPE, [to, value, data]),
            signature: '0x',
        })
    }

    static async fromUserOperation(
        chainId: ChainId,
        entryPoint: string,
        userOperation: UserOperation,
    ): Promise<UserTransaction> {
        const userTransaction = new UserTransaction(chainId, entryPoint, {
            ...DEFAULT_USER_OPERATION,
            ...userOperation,
        })
        return userTransaction.fill()
    }
}
