import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { getAllMaskDappContractInfo, resolveNetworkOnRabby } from './helpers'
import type { RabbyTokenAPI } from '../types'
import { NON_FUNGIBLE_TOKEN_API_URL } from './constants'

export * from './constants'

export class RabbyAPI implements RabbyTokenAPI.Provider<ChainId> {
    async getNonFungibleTokensFromTokenList(chainId: ChainId, account: string) {
        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'nft')
        const networkType = chainResolver.chainNetworkType(chainId)

        if (!networkType || !account) return []
        const response = await fetch(
            urlcat(NON_FUNGIBLE_TOKEN_API_URL, { id: account, chain_id: resolveNetworkOnRabby(networkType) }),
        )
        const rawData: { contracts: RabbyTokenAPI.NFTInfo[] } = await response.json()

        return rawData.contracts
            .filter((x) => x.amount !== '0' && x.is_erc721)
            .map((x) => {
                const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                    isSameAddress(y.address, x.spender.id),
                )

                if (maskDappContractInfo) {
                    return {
                        ...x,
                        spender: {
                            id: x.spender.id,
                            name: maskDappContractInfo.name,
                            logo: maskDappContractInfo.logo,
                        },
                        isMaskDapp: true,
                    }
                }

                return { ...x, isMaskDapp: false }
            })
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return Number(b.amount) - Number(a.amount)
            }) as RabbyTokenAPI.NFTInfo[]
    }
}
