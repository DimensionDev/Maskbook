import urlcat from 'urlcat'
import { ChainId, UserOperation, UserTransaction } from '@masknet/web3-shared-evm'
import type { BundlerAPI } from '../types/Bundler.js'
import { BUNDLER_ROOT } from './constants.js'

export class SmartPayBundlerAPI implements BundlerAPI.Provider {
    private async healthz() {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/healthz'), {
            method: 'GET',
        })
        const json: BundlerAPI.Healthz = await response.json()
        return json
    }

    private async handle(userOperation: UserOperation) {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/handle'), {
            method: 'POST',
            body: JSON.stringify(UserTransaction.toUserOperationSnakeCase(userOperation)),
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

        const entryPoints = await this.getSupportedEntryPoints()
        return this.handle(userOperation)
    }
}
