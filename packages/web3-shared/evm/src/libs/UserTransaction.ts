import { omit } from 'lodash-es'
import { keccak256 } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import { isZeroAddress } from '../utils/index.js'

export class UserTransaction {
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    private CALL_OP_TYPE = {
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
        return this.userOperation.paymaster && !isZeroAddress(this.userOperation.paymaster)
    }

    get pack() {
        const encoded = this.coder.encodeParameter(this.CALL_OP_TYPE, this.userOperation)
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get packForSignature() {
        const encoded = this.coder.encodeParameter(this.CALL_OP_TYPE, {
            ...this.userOperation,
            signature: '0x',
        })
        return `0x${encoded.slice(66, encoded.length - 64)}`
    }

    get hash() {
        return keccak256(this.packForSignature)
    }

    get requestId() {
        return keccak256(
            this.coder.encodeParameters(['bytes32', 'address', 'uint256'], [this.hash, this.entryPoint, this.chainId]),
        )
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

    static fromUserOperation(chainId: ChainId, entryPoint: string, userOperation: UserOperation): UserTransaction {
        return new UserTransaction(chainId, entryPoint, userOperation)
    }

    static fromTransaction(chainId: ChainId, entryPoint: string, transaction: Transaction): UserTransaction {
        throw new Error('Not implemented.')
    }

    static toTransaction(chainId: ChainId, entryPoint: string, userOperation: UserOperation) {
        return {}
    }

    static toUserOperationSnakeCase(userOperation: UserOperation) {
        return {
            ...omit(userOperation, [
                'initCode',
                'callData',
                'callGas',
                'verificationGas',
                'preVerificationGas',
                'maxFeePerGas',
                'maxPriorityFeePerGas',
                'paymasterData',
            ]),
            init_code: userOperation.initCode,
            call_data: userOperation.callData,
            call_gas: userOperation.callGas,
            verification_gas: userOperation.verificationGas,
            pre_verification_gas: userOperation.preVerificationGas,
            max_fee_per_gas: userOperation.maxFeePerGas,
            max_priority_fee_per_gas: userOperation.maxPriorityFeePerGas,
            paymaster_data: userOperation.paymasterData,
        }
    }
}
