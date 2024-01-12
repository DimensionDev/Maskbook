import urlcat from 'urlcat'
import { omit } from 'lodash-es'
import type { ChainId, UserOperation } from '@masknet/web3-shared-evm'
import { toBase64, fromHex } from '@masknet/shared-base'
import { BUNDLER_PROD } from '../constants.js'
import type { BundlerAPI } from '../../entry-types.js'
import { Duration } from '../../helpers/fetchCached.js'
import { fetchCachedJSON, fetchJSON } from '../../helpers/fetchJSON.js'

class SmartPayBundlerAPI implements BundlerAPI.Provider {
    private healthz() {
        return fetchCachedJSON<BundlerAPI.Healthz>(
            urlcat(BUNDLER_PROD, '/healthz'),
            {
                method: 'GET',
            },
            {
                cacheDuration: Duration.TWELVE_HOURS,
            },
        )
    }

    private async handle(userOperation: UserOperation) {
        const { tx_hash, message = 'Unknown Error' } = await fetchJSON<{ tx_hash: string; message?: string }>(
            urlcat(BUNDLER_PROD, '/handle'),
            {
                method: 'POST',
                body: JSON.stringify({
                    user_operations: [
                        {
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
                            nonce: userOperation.nonce?.toFixed() ?? '0',
                            init_code: toBase64(fromHex(userOperation.initCode ?? '0x')),
                            call_data: toBase64(fromHex(userOperation.callData ?? '0x')),
                            call_gas: userOperation.callGas,
                            verification_gas: userOperation.verificationGas,
                            pre_verification_gas: userOperation.preVerificationGas,
                            max_fee_per_gas: userOperation.maxFeePerGas,
                            max_priority_fee_per_gas: userOperation.maxPriorityFeePerGas,
                            paymaster_data: toBase64(fromHex(userOperation.paymasterData ?? '0x')),
                            signature: toBase64(fromHex(userOperation.signature ?? '0x')),
                        },
                    ],
                }),
            },
        )
        if (tx_hash) return tx_hash
        throw new Error(message)
    }

    private async assetChainId(chainId: ChainId) {
        const supportedChainId = await this.getSupportedChainId()
        if (supportedChainId !== chainId) throw new Error(`Not supported ${chainId}.`)
    }

    async getSigner(chainId: ChainId): Promise<string> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return healthz.bundler_eoa
    }

    async getSupportedChainId(): Promise<ChainId> {
        const healthz = await this.healthz()
        return Number.parseInt(healthz.chain_id, 10) as ChainId
    }
    async getSupportedEntryPoints(chainId: ChainId): Promise<string[]> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return [healthz.entrypoint_contract_address]
    }
    async sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        await this.assetChainId(chainId)
        return this.handle(userOperation)
    }
}
export const SmartPayBundler = new SmartPayBundlerAPI()
