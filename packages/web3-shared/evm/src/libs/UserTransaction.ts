import { omit } from 'lodash-es'
import { keccak256 } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { ChainId, UserOperation } from '../types/index.js'
import { isZeroAddress } from '../utils/index.js'

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
        return this.operation.paymaster && !isZeroAddress(this.operation.paymaster)
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
                'callGas',
                'callData',
                'verificationGas',
                'preVerificationGas',
                'maxFeePerGas',
                'maxPriorityFeePerGas',
                'paymaster',
            ]),
            call_data: this.operation.callData,
            verification_gas: this.operation.verificationGas,
            pre_verification_gas: this.operation.preVerificationGas,
            max_fee_per_gas: this.operation.maxFeePerGas,
            max_priority_fee_per_gas: this.operation.maxPriorityFeePerGas,
            paymaster_data: this.operation.paymasterData,
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

    async estimateVerificationGas() {
        // 100000 default verification gas. will add create2 cost (3200+200*length) if initCode exists
        const verificationGas = 100000

        if (this.initCode.length > 0) {
            return verificationGas + 3200 + 200 * this.initCode.length
        }
        return verificationGas
    }

    async estimateExecutionGas() {}

    async estimateGas() {}
}
