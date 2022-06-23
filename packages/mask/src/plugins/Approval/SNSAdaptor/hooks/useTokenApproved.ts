import { useAsyncRetry } from 'react-use'
import urlcat from 'urlcat'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { omit } from 'lodash-unified'
import { queryNetworkMappings } from '../constants'
import { useAllMaskDappContractInfo } from './useAllMaskDappContractInfo'
import { isSameAddress } from '@masknet/web3-shared-base'

const API_URL = 'https://api.rabby.io/v1/user/token_authorized_list'

interface RawSpender {
    id: string
    value: number
    exposure_usd: number
    protocol: {
        id: string
        name: string
        logo_url: string
        chain: string
    } | null
    is_contract: boolean
    is_open_source: boolean
    is_hacked: boolean
    is_abandoned: boolean
}

interface RawTokenInfo {
    id: string
    name: string
    symbol: string
    logo_url: string
    chain: string
    price: number
    balance: number
    spenders: RawSpender[]
}

type TokenInfo = Omit<RawTokenInfo, 'spenders'>

type Spender = Omit<RawSpender, 'protocol'> & {
    tokenInfo: TokenInfo
    name: string | undefined
    logo: string | React.ReactNode | undefined
    isMaskDapp: boolean
}

type ResponseData = RawTokenInfo[]

export function useTokenApproved(account: string, chainId: ChainId) {
    const maskDappContractInfoList = useAllMaskDappContractInfo(chainId, 'token')
    return useAsyncRetry(async () => {
        const networkType = chainResolver.chainNetworkType(chainId)
        if (!networkType || !account) return []
        const response = await fetch(urlcat(API_URL, { id: account, chain_id: queryNetworkMappings[networkType] }))
        const rawData: ResponseData = await response.json()

        const data = rawData
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
            .sort((a, b) => a.exposure_usd - b.exposure_usd)
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return 0
            })
        return []
    }, [account, chainId, API_URL, queryNetworkMappings, maskDappContractInfoList])
}
