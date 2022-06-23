import { useAsyncRetry } from 'react-use'
import urlcat from 'urlcat'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { omit } from 'lodash-unified'
import { queryNetworkMappings } from '../constants'
import type { Spender, RawTokenInfo } from '../types'
import { useAllMaskDappContractInfo } from './useAllMaskDappContractInfo'
import { isSameAddress } from '@masknet/web3-shared-base'

const API_URL = 'https://api.rabby.io/v1/user/token_authorized_list'

export function useTokenApproved(account: string, chainId: ChainId) {
    const maskDappContractInfoList = useAllMaskDappContractInfo(chainId, 'token')
    return useAsyncRetry(async () => {
        const networkType = chainResolver.chainNetworkType(chainId)
        if (!networkType || !account) return []
        const response = await fetch(urlcat(API_URL, { id: account, chain_id: queryNetworkMappings[networkType] }))
        const rawData: RawTokenInfo[] = await response.json()

        return rawData
            .reduce<Spender[]>((acc, cur) => {
                const tokenInfo = omit(cur, ['spenders'])
                return acc.concat(
                    cur.spenders.map((rawSpender) => {
                        const spender = omit(
                            {
                                ...rawSpender,
                                name: rawSpender.protocol?.name,
                                logo: rawSpender.protocol?.logo_url,
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
            .sort((a, b) => b.exposure_usd - a.exposure_usd)
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return 0
            })
    }, [account, chainId])
}
