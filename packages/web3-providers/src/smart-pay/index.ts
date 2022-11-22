import urlcat from 'urlcat'
import { omit } from 'lodash-es'
import type { ChainId, UserOperation } from '@masknet/web3-shared-evm'
import type { BundlerAPI } from '../types/Bundler.js'
import { BUNDLER_ROOT } from './constants.js'

export class SmartPayBundlerAPI implements BundlerAPI.Provider {
    private encodeUserOperation(userOperation: UserOperation) {
        return {
            ...omit(userOperation, [
                'initCode',
                'callGas',
                'callData',
                'verificationGas',
                'preVerificationGas',
                'maxFeePerGas',
                'maxPriorityFeePerGas',
                'paymaster',
            ]),
            call_data: userOperation.callData,
            verification_gas: userOperation.verificationGas,
            pre_verification_gas: userOperation.preVerificationGas,
            max_fee_per_gas: userOperation.maxFeePerGas,
            max_priority_fee_per_gas: userOperation.maxPriorityFeePerGas,
            paymaster_data: userOperation.paymasterData,
        }
    }

    private async healthz() {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/healthz'), {
            method: 'GET',
        })
        const json = (await response.json()) as {
            bundler_eoa: string
            chain_id: string
            entrypoint_contract_address: string
        }
        return json
    }

    private async handle(userOperation: UserOperation) {
        const body = this.encodeUserOperation(userOperation)
        const response = await fetch(urlcat(BUNDLER_ROOT, '/handle'), {
            method: 'POST',
            body: JSON.stringify(body),
        })
        const json = (await response.json()) as { tx_hash: string }
        return json.tx_hash
    }

    async getSigner(): Promise<string> {
        const healthz = await this.healthz()
        return healthz.bundler_eoa
    }

    async getSupportedChainIds(): Promise<ChainId[]> {
        const healthz = await this.healthz()
        return [Number.parseInt(healthz.chain_id, 10)] as ChainId[]
    }
    async getSupportedEntryPoints(): Promise<string[]> {
        const healthz = await this.healthz()
        return [healthz.entrypoint_contract_address]
    }
    simulateUserOperation(
        chainId: ChainId,
        userOperation: UserOperation,
    ): Promise<{ preOpGas: string; prefund: string }> {
        throw new Error('Method not implemented.')
    }
    async sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        const chainIds = await this.getSupportedChainIds()

        if (!chainIds.includes(chainId)) throw new Error('Unable to send UserOperation.')
        return this.handle(userOperation)
    }
}
