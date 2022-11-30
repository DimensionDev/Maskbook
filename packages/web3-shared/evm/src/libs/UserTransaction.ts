import { bytesToHex, hexToBytes, keccak256 } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import { isZeroAddress } from '../utils/index.js'

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

export class UserTransaction {
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    constructor(private chainId: ChainId, private entryPoint: string, private userOperation: UserOperation) {}

    get sender() {
        return this.userOperation.sender
    }

    get signature() {
        return this.userOperation.signature
    }

    get initCode() {
        return this.userOperation.initCode
    }

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
    }

    async estimateVerificationGas() {
        // 100000 default verification gas. will add create2 cost (3200+200*length) if initCode exists
        const verificationGas = 100000

        if (this.initCode && this.initCode.length > 0) {
            return verificationGas + 3200 + 200 * this.initCode.length
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
        return new UserTransaction(chainId, entryPoint, userOperation)
    }
}
