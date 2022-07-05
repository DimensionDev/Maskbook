import { useAsyncRetry } from 'react-use'
import urlcat from 'urlcat'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { resolveNetworkOnRabby } from '../pipes'
import type { NFTInfo } from '../types'
import { useAllMaskDappContractInfo } from './useAllMaskDappContractInfo'
import { isSameAddress } from '@masknet/web3-shared-base'

const API_URL = 'https://api.rabby.io/v1/user/nft_authorized_list'

export function useApprovedNFTList(account: string, chainId: ChainId) {
    const maskDappContractInfoList = useAllMaskDappContractInfo(chainId, 'nft')
    return useAsyncRetry(async () => {
        const networkType = chainResolver.chainNetworkType(chainId)
        if (!networkType || !account) return []
        const response = await fetch(urlcat(API_URL, { id: account, chain_id: resolveNetworkOnRabby(networkType) }))
        const rawData: { contracts: NFTInfo[] } = await response.json()
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
            }) as NFTInfo[]
    }, [account, chainId])
}
