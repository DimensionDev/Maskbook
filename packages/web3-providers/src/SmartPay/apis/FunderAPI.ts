import urlcat from 'urlcat'
import { BigNumber } from 'bignumber.js'
import { ChainId, type TransactionReceipt } from '@masknet/web3-shared-evm'
import { EMPTY_LIST, type Proof } from '@masknet/shared-base'
import { EVMWeb3Readonly } from '../../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { FUNDER_PROD } from '../constants.js'
import { fetchJSON, fetchCachedJSON } from '../../helpers/fetchJSON.js'
import { FunderAPI } from '../../entry-types.js'

class SmartPayFunderAPI implements FunderAPI.Provider<ChainId> {
    private async assetChainId(chainId: ChainId) {
        if (![ChainId.Polygon, ChainId.Mumbai].includes(chainId)) throw new Error(`Not supported ${chainId}.`)
    }

    private async getWhiteList(handler: string) {
        return fetchCachedJSON<FunderAPI.WhiteList>(urlcat(FUNDER_PROD, '/whitelist', { twitterHandle: handler }))
    }

    async getRemainFrequency(handler: string) {
        try {
            const result = await this.getWhiteList(handler)
            if (!result.totalCount || result.twitterHandler !== handler.toLowerCase()) return 0
            return BigNumber.max(result.totalCount - result.usedCount, 0).toNumber()
        } catch {
            return 0
        }
    }

    async getOperationsByOwner(chainId: ChainId, owner: string) {
        await this.assetChainId(chainId)

        try {
            const operations = await fetchCachedJSON<FunderAPI.Operation[]>(
                urlcat(FUNDER_PROD, '/operation', { scanKey: FunderAPI.ScanKey.OwnerAddress, scanValue: owner }),
            )
            const allSettled = await Promise.allSettled(
                operations.map<Promise<TransactionReceipt | null>>((x) =>
                    EVMWeb3Readonly.getTransactionReceipt(x.tokenTransferTx, {
                        chainId,
                    }),
                ),
            )

            return operations.filter((_, i) => {
                const receipt = allSettled[i] as PromiseFulfilledResult<TransactionReceipt | null>
                return receipt.status === 'fulfilled' && receipt.value?.status
            })
        } catch {
            return EMPTY_LIST
        }
    }

    async fund(chainId: ChainId, proof: Proof): Promise<FunderAPI.Fund> {
        await this.assetChainId(chainId)

        return fetchJSON<FunderAPI.Fund>(urlcat(FUNDER_PROD, '/verify'), {
            method: 'POST',
            body: JSON.stringify(proof),
            headers: { 'Content-Type': 'application/json' },
        })
    }

    async verify(handler: string) {
        try {
            const result = await this.getWhiteList(handler)
            return result.twitterHandler === handler.toLowerCase() && result.usedCount < result.totalCount
        } catch {
            return false
        }
    }
}
export const SmartPayFunder = new SmartPayFunderAPI()
