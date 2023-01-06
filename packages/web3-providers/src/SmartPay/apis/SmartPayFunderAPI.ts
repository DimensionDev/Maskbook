import urlcat from 'urlcat'
import { ChainId, TransactionReceipt } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { FunderAPI } from '../../types/Funder.js'
import { Web3API } from '../../EVM/index.js'
import { fetchJSON, fetchSquashed } from '../../entry-helpers.js'
import { FUNDER_PROD } from '../constants.js'

const FUNDER_ROOT = FUNDER_PROD

export class SmartPayFunderAPI implements FunderAPI.Provider<ChainId> {
    private web3 = new Web3API()

    private async assetChainId(chainId: ChainId) {
        if (![ChainId.Matic, ChainId.Mumbai].includes(chainId)) throw new Error(`Not supported ${chainId}.`)
    }

    private async getWhiteList(handler: string) {
        return fetchJSON<FunderAPI.WhiteList>(
            urlcat(FUNDER_ROOT, '/whitelist', { twitterHandler: handler }),
            {},
            fetchSquashed,
        )
    }

    async getRemainFrequency(handler: string) {
        try {
            const result = await this.getWhiteList(handler)
            if (!result.totalCount || result.twitterHandler !== handler) return 0
            return result.totalCount - result.usedCount
        } catch {
            return 0
        }
    }

    async getOperationsByOwner(chainId: ChainId, owner: string) {
        await this.assetChainId(chainId)

        try {
            const operations = await fetchJSON<FunderAPI.Operation[]>(
                urlcat(FUNDER_ROOT, '/operation', { scanKey: FunderAPI.ScanKey.OwnerAddress, scanValue: owner }),
                {},
                fetchSquashed,
            )
            const web3 = this.web3.createWeb3(chainId)
            const allSettled = await Promise.allSettled(
                operations.map<Promise<TransactionReceipt | null>>((x) =>
                    web3.eth.getTransactionReceipt(x.tokenTransferTx),
                ),
            )

            return operations.filter((_, i) => {
                const receipt = allSettled[i] as PromiseFulfilledResult<TransactionReceipt | null>
                return receipt.status === 'fulfilled' && receipt?.value?.status === true
            })
        } catch {
            return EMPTY_LIST
        }
    }

    async fund(chainId: ChainId, proof: FunderAPI.Proof): Promise<FunderAPI.Fund> {
        await this.assetChainId(chainId)

        return fetchJSON<FunderAPI.Fund>(urlcat(FUNDER_ROOT, '/verify'), {
            method: 'POST',
            body: JSON.stringify(proof),
            headers: { 'Content-Type': 'application/json' },
        })
    }

    async verify(handler: string) {
        try {
            const result = await this.getWhiteList(handler)
            return result.twitterHandler === handler && result.usedCount < result.totalCount
        } catch {
            return false
        }
    }
}
