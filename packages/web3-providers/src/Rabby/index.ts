import urlcat from 'urlcat'
import { omit } from 'lodash-es'
import { type ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import { isSameAddress, type NonFungibleContractSpender, type FungibleTokenSpender } from '@masknet/web3-shared-base'
import { getAllMaskDappContractInfo } from '../helpers/getAllMaskDappContractInfo.js'
import { NON_FUNGIBLE_TOKEN_API_URL, FUNGIBLE_TOKEN_API_URL } from './constants.js'
import type { NFTInfo, RawTokenInfo, TokenSpender } from './types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { AuthorizationAPI } from '../entry-types.js'
import { getDebankChain } from '../DeBank/helpers.js'

class RabbyAPI implements AuthorizationAPI.Provider<ChainId> {
    async getNonFungibleTokenSpenders(chainId: ChainId, account: string) {
        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'nft')
        const debankChainId = getDebankChain(chainId)

        if (!debankChainId || !account || !isValidChainId(chainId)) return []
        const rawData = await fetchJSON<{ contracts: NFTInfo[] }>(
            urlcat(NON_FUNGIBLE_TOKEN_API_URL, { id: account, chain_id: debankChainId }),
        )

        return rawData.contracts
            .filter((x) => x.amount !== '0' && x.is_erc721)
            .map((x) => {
                const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                    isSameAddress(y.address, x.spender.id),
                )

                if (maskDappContractInfo) {
                    return {
                        ...x,
                        contract: {
                            address: x.contract_id,
                            name: x.contract_name,
                        },
                        address: x.spender.id,
                        name: maskDappContractInfo.name,
                        logo: maskDappContractInfo.logo,
                        isMaskDapp: true,
                    }
                }

                return {
                    ...x,
                    ...x.spender,
                    address: x.spender.id,
                    contract: {
                        address: x.contract_id,
                        name: x.contract_name,
                    },
                    isMaskDapp: false,
                }
            })
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return Number(b.amount) - Number(a.amount)
            }) as Array<NonFungibleContractSpender<ChainId, SchemaType>>
    }

    async getFungibleTokenSpenders(chainId: ChainId, account: string) {
        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'token')
        const debankChainId = getDebankChain(chainId)

        if (!debankChainId || !account || !isValidChainId(chainId)) return []

        const rawData = await fetchJSON<RawTokenInfo[]>(
            urlcat(FUNGIBLE_TOKEN_API_URL, { id: account, chain_id: debankChainId }),
        )
        return rawData
            .reduce<TokenSpender[]>((acc, cur) => {
                const tokenInfo = omit({ ...cur, address: cur.id, logoURL: cur.logo_url }, ['spenders'])
                return acc.concat(
                    cur.spenders.map((rawSpender) => {
                        const spender = omit(
                            {
                                ...rawSpender,
                                name: rawSpender.protocol?.name,
                                logo: rawSpender.protocol?.logo_url,
                                address: rawSpender.id,
                                amount: rawSpender.value,
                                tokenInfo,
                            },
                            ['protocol'],
                        )

                        const maskDappContractInfo = maskDappContractInfoList.find((x) =>
                            isSameAddress(x.address, spender.id),
                        )

                        if (maskDappContractInfo) {
                            return {
                                ...spender,
                                name: maskDappContractInfo.name,
                                logo: maskDappContractInfo.logo,
                                isMaskDapp: true,
                            }
                        }

                        return { ...spender, isMaskDapp: false }
                    }),
                )
            }, [])
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return b.exposure_usd - a.exposure_usd
            }) as Array<FungibleTokenSpender<ChainId, SchemaType>>
    }
}
export const Rabby = new RabbyAPI()
