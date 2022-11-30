import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import * as ABICoder from 'web3-eth-abi'
import { AbiItem, bytesToHex, hexToBytes, keccak256, toHex, toNumber } from 'web3-utils'
import { toFixed } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import EntryPointABI from '@masknet/web3-contracts/abis/EntryPoint.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { EntryPoint } from '@masknet/web3-contracts/types/EntryPoint.js'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import { calculateDataCost, getZeroAddress, isZeroAddress } from '../helpers/index.js'

const CALL_OP_TYPE = {
    callOp: {
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
    preVerificationGas: '21000',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '1000000000',
    paymaster: getZeroAddress(),
    paymasterData: '0x',
    signature: '0x',
}

const web3 = new Web3()
const coder = ABICoder as unknown as ABICoder.AbiCoder

/**
 * The wrapped UserOperation helper.
 * Learn more: https://github.com/eth-infinitism/account-abstraction/blob/develop/test/UserOp.ts
 */
export class UserTransaction {
    private get entryPointContract() {
        return new web3.eth.Contract(EntryPointABI as AbiItem[], this.entryPoint) as unknown as EntryPoint
    }

    private get walletContract() {
        return new web3.eth.Contract(WalletABI as AbiItem[], this.userOperation.sender) as unknown as Wallet
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

    get hasPaymaster() {
        return !!(this.userOperation.paymaster && !isZeroAddress(this.userOperation.paymaster))
    }

    /**
     * Pack everything without signature
     */
    get pack() {
        const encoded = coder.encodeParameter(CALL_OP_TYPE, {
            ...this.userOperation,
            signature: '0x',
        })
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    /**
     * Pack everything include signature
     */
    get packAll() {
        const encoded = coder.encodeParameter(CALL_OP_TYPE, this.userOperation)
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

    async fill() {
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
        } = this.userOperation

        if (initCode && initCode !== '0x') {
            // caution: the creator needs to set the latest index of the contract account.
            // otherwise, always treat the operation to create the initial account.
            if (!nonce) this.userOperation.nonce = 0
            if (!sender) {
                if (!this.entryPointContract) throw new Error('Failed to create entry point contract.')
                this.userOperation.sender = await this.entryPointContract.methods
                    .getSenderAddress(initCode, nonce)
                    .call()
            }
            if (!verificationGas) {
                this.userOperation.verificationGas = toFixed(
                    new BigNumber(DEFAULT_USER_OPERATION.verificationGas).plus(32000 + (200 * initCode.length) / 2),
                )
            }
        }
        if (!this.userOperation.nonce) {
            if (!this.walletContract) throw new Error('Failed to create wallet contract.')
            this.userOperation.nonce = toNumber(await this.walletContract.methods.nonce().call())
        }
        if (!callGas && callData && callData !== '0x') {
            this.userOperation.callGas = toFixed(
                await web3.eth.estimateGas({
                    from: this.entryPoint,
                    to: sender,
                    data: callData,
                }),
            )
        }
        if (!maxFeePerGas) {
            const block = await web3.eth.getBlock('latest')
            this.userOperation.maxFeePerGas = toFixed(
                new BigNumber(block.baseFeePerGas ?? 0).plus(
                    maxPriorityFeePerGas ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas,
                ),
            )
        }
        if (!verificationGas) {
            this.userOperation.verificationGas = toFixed(DEFAULT_USER_OPERATION.verificationGas)
        }
        if (!preVerificationGas) {
            this.userOperation.preVerificationGas = toFixed(calculateDataCost(this.packAll))
        }
        if (!maxPriorityFeePerGas) {
            this.userOperation.maxPriorityFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
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
        const { nonce, callGas, verificationGas, preVerificationGas, maxFeePerGas, maxPriorityFeePerGas } =
            this.userOperation
        return {
            ...this.userOperation,
            nonce,
            callGas: callGas ? toHex(callGas) : undefined,
            verificationGas: verificationGas ? toHex(verificationGas) : undefined,
            preVerificationGas: preVerificationGas ? toHex(preVerificationGas) : undefined,
            maxFeePerGas: maxFeePerGas ? toHex(maxFeePerGas) : undefined,
            maxPriorityFeePerGas: maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : undefined,
        }
    }

    static async fromTransaction(
        chainId: ChainId,
        entryPoint: string,
        transaction: Transaction,
    ): Promise<UserTransaction> {
        const { from, to, nonce, value = '0', data = '0x' } = transaction

        if (!from) throw new Error('No sender address.')
        if (!to) throw new Error('No destination address.')

        const userOperation: UserOperation = {
            sender: from,
            nonce,
            callData: coder.encodeFunctionCall(CALL_WALLET_TYPE, [to, value, data]),
            callGas: '0',
            verificationGas: '0',
            preVerificationGas: '0',
            maxFeePerGas: '0',
            maxPriorityFeePerGas: '0',
            signature: '0x',
        }
        return UserTransaction.fromUserOperation(chainId, entryPoint, userOperation)
    }

    static async fromUserOperation(
        chainId: ChainId,
        entryPoint: string,
        userOperation: UserOperation,
    ): Promise<UserTransaction> {
        const userTransaction = new UserTransaction(chainId, entryPoint, userOperation)
        return userTransaction.fill()
    }
}
