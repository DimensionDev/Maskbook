import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import * as ABICoder from 'web3-eth-abi'
import { AbiItem, bytesToHex, hexToBytes, keccak256, toHex } from 'web3-utils'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import EntryPointABI from '@masknet/web3-contracts/abis/EntryPoint.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import type { EntryPoint } from '@masknet/web3-contracts/types/EntryPoint.js'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import { calcuateDataCost, getZeroAddress, isZeroAddress } from '../helpers/index.js'

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

const DEFAULT_USER_OPERATION: UserOperation = {
    sender: getZeroAddress(),
    nonce: '0',
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

/**
 * The wrapped UserOperation helper.
 * Learn more: https://github.com/eth-infinitism/account-abstraction/blob/develop/test/UserOp.ts
 */
export class UserTransaction {
    private web3 = new Web3()
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    private get entryPointContract() {
        return new this.web3.eth.Contract(EntryPointABI as AbiItem[], this.entryPoint) as unknown as EntryPoint
    }

    private get walletConract() {
        return new this.web3.eth.Contract(WalletABI as AbiItem[], this.userOperation.sender) as unknown as Wallet
    }

    /**
     * @deprecated Don't new UserTransaction()
     * Use UserTransaction.fromTransaction() or UserTranaction.fromUserOperation() stead.
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

    get pack() {
        const encoded = this.coder.encodeParameter(CALL_OP_TYPE, {
            ...this.userOperation,
            signature: '0x',
        })
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get packWithSignature() {
        const encoded = this.coder.encodeParameter(CALL_OP_TYPE, this.userOperation)
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get hash() {
        return keccak256(this.pack)
    }

    get requestId() {
        return keccak256(
            this.coder.encodeParameters(['bytes32', 'address', 'uint256'], [this.hash, this.entryPoint, this.chainId]),
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

        if (initCode) {
            if (!nonce) this.userOperation.nonce = '0'
            if (!sender) {
                if (!this.entryPointContract) throw new Error('Failed to create entry point contract.')
                this.userOperation.sender = await this.entryPointContract.methods
                    .getSenderAddress(initCode, nonce)
                    .call()
            }
            if (!verificationGas) {
                this.userOperation.verificationGas = new BigNumber(DEFAULT_USER_OPERATION.verificationGas)
                    .plus(32000 + (200 * initCode.length) / 2)
                    .toFixed()
            }
        }
        if (!this.userOperation.nonce) {
            if (!this.walletConract) throw new Error('Failed to create wallet contract.')
            this.userOperation.nonce = await this.walletConract.methods.nonce().call()
        }
        if (!callGas && callData) {
            const estimated = await this.web3.eth.estimateGas({
                from: this.userOperation.sender,
                to: this.userOperation.sender,
                data: this.userOperation.callData,
            })
            this.userOperation.callGas = estimated.toFixed()
        }
        if (!maxFeePerGas) {
            const block = await this.web3.eth.getBlock('latest')
            this.userOperation.maxFeePerGas = new BigNumber(block.baseFeePerGas ?? 0)
                .plus(this.userOperation.maxPriorityFeePerGas ?? DEFAULT_USER_OPERATION.maxPriorityFeePerGas)
                .toFixed()
        }
        if (!maxPriorityFeePerGas) {
            this.userOperation.maxPriorityFeePerGas = DEFAULT_USER_OPERATION.maxPriorityFeePerGas
        }
        if (isZeroAddress(preVerificationGas)) {
            this.userOperation.preVerificationGas = calcuateDataCost(this.pack).toFixed()
        }
        return this
    }

    async estimateVerificationGas() {
        // 100000 default verification gas. will add create2 cost (3200+200*length) if initCode exists
        const verificationGas = 100000
        const initCode = this.userOperation.initCode

        if (initCode && initCode.length > 0) {
            return verificationGas + 3200 + 200 * initCode.length
        }
        return verificationGas
    }

    async estimateExecutionGas() {}

    async estimateGas() {}

    toTransaction(): Transaction {
        const callBytes = this.userOperation.callData ? hexToBytes(this.userOperation.callData) : []

        return {
            from: this.userOperation.sender,
            to: bytesToHex(callBytes.slice(12, 36)),
            value: bytesToHex(callBytes.slice(36, 68)),
            gas: this.userOperation.callGas,
            maxFeePerGas: this.userOperation.maxFeePerGas,
            maxPriorityFeePerGas: this.userOperation.maxPriorityFeePerGas,
            nonce: Number.parseInt(this.userOperation.nonce, 16),
            data: bytesToHex(callBytes.slice(68)),
        }
    }

    toUserOperation() {
        return {
            ...this.userOperation,
            nonce: toHex(this.userOperation.nonce),
            callGas: toHex(this.userOperation.callGas),
            verificationGas: toHex(this.userOperation.verificationGas),
            preVerificationGas: toHex(this.userOperation.preVerificationGas),
            maxFeePerGas: toHex(this.userOperation.maxFeePerGas),
            maxPriorityFeePerGas: toHex(this.userOperation.maxPriorityFeePerGas),
        }
    }

    static async fromTransaction(
        chainId: ChainId,
        entryPoint: string,
        transaction: Transaction,
    ): Promise<UserTransaction> {
        throw new Error('Not implemented.')
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
