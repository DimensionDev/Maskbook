import { omit } from 'lodash-es'
import { keccak256 } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { ChainId, Transaction, UserOperation } from '../types/index.js'
import { isEmptyHex } from '../utils/index.js'

export class UserTransaction {
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    constructor(private chainId: ChainId, private entryPoint: string, private operation: UserOperation) {}

    get sender() {
        return this.operation.sender
    }

    get signature() {
        return this.operation.signature
    }

    get initCode() {
        return ''
    }

    get hasPaymaster() {
        return this.operation.paymasterAndData && !isEmptyHex(this.operation.paymasterAndData)
    }

    get asCamelCase() {
        return {
            ...this.operation,
            signature: this.signature,
        }
    }

    get asSnakeCase() {
        return {
            ...omit(this.operation, [
                'initCode',
                'callData',
                'callGasLimit',
                'verificationGasLimit',
                'preVerificationGasLimit',
                'maxFeePerGas',
                'maxPriorityFeePerGas',
                'paymasterAndData',
            ]),
            init_code: this.operation.initCode,
            call_data: this.operation.callData,
            call_gas_limit: this.operation.callGasLimit,
            verification_gas_limit: this.operation.verificationGasLimit,
            pre_verification_gas_limit: this.operation.preVerificationGasLimit,
            max_fee_per_gas: this.operation.maxFeePerGas,
            max_priority_fee_per_gas: this.operation.maxPriorityFeePerGas,
            paymaster_and_data: this.operation.paymasterAndData,
            signature: this.signature,
        }
    }

    get asTransaction() {
        return {}
    }

    get pack() {
        return ''
    }

    get packForSignature() {
        const userOpType = {
            components: [
                { type: 'address', name: 'sender' },
                { type: 'uint256', name: 'nonce' },
                { type: 'bytes', name: 'initCode' },
                { type: 'bytes', name: 'callData' },
                { type: 'uint256', name: 'callGas' },
                { type: 'uint256', name: 'verificationGas' },
                { type: 'uint256', name: 'preVerificationGas' },
                { type: 'uint256', name: 'maxFeePerGas' },
                { type: 'uint256', name: 'maxPriorityFeePerGas' },
                { type: 'address', name: 'paymaster' },
                { type: 'bytes', name: 'paymasterData' },
                { type: 'bytes', name: 'signature' },
            ],
            name: 'userOp',
            type: 'tuple',
        }
    }

    get hash() {
        return keccak256(this.pack)
    }

    get requestId() {
        return keccak256(
            this.coder.encodeParameters(['bytes32', 'address', 'uint256'], [this.hash, this.entryPoint, this.chainId]),
        )
    }

    async estimateVerificationGasLimit() {
        // 100000 default verification gas. will add create2 cost (3200+200*length) if initCode exists
        const verificationGas = 100000

        if (this.initCode.length > 0) {
            return verificationGas + 3200 + 200 * this.initCode.length
        }
        return verificationGas
    }

    async estimateExecutionGasLimit() {}

    async estimateGasLimit() {}

    static fromUserOperation(userOperation?: UserOperation): UserTransaction {
        throw new Error('Not implemented.')
    }

    static fromTransaction(transaction?: Transaction): UserTransaction {
        throw new Error('Not implemented.')
    }
}
