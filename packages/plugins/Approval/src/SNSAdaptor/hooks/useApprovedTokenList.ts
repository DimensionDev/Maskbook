import { useAsyncRetry } from 'react-use'
import urlcat from 'urlcat'
import { omit } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { resolveNetworkOnRabby } from '../pipes.js'
import type { TokenSpender, RawTokenInfo } from '../types.js'
import { useAllMaskDappContractInfo } from './useAllMaskDappContractInfo.js'

const API_URL = 'https://api.rabby.io/v1/user/token_authorized_list'

export function useApprovedTokenList(account: string, chainId: ChainId) {
    const maskDappContractInfoList = useAllMaskDappContractInfo(chainId, 'token')
    return useAsyncRetry(async () => {
        const networkType = chainResolver.networkType(chainId)
        if (!networkType || !account) return EMPTY_LIST
        const response = await fetch(urlcat(API_URL, { id: account, chain_id: resolveNetworkOnRabby(networkType) }))
        const rawData: RawTokenInfo[] = await response.json()

        return rawData
            .reduce<TokenSpender[]>((acc, cur) => {
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
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return b.exposure_usd - a.exposure_usd
            })
    }, [account, chainId])
}
