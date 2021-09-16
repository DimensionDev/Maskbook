import { useAccount, useAugurConstants, useWeb3 } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginAugurRPC } from '../messages'
import { fetchMarket } from './useMarket'

export function useUserPositions() {
    const { GRAPH_URL, AMM_FACTORY_ADDRESS } = useAugurConstants()
    const web3 = useWeb3()

    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !GRAPH_URL) return
        const userPositions = await PluginAugurRPC.fetchUserPositions(account, GRAPH_URL)
        userPositions?.map(async (userPosition) => {
            try {
                console.log(userPosition)
                userPosition.market = await fetchMarket(
                    {
                        address: userPosition.address,
                        id: userPosition.id,
                        link: '', // TODO
                        ammAddress: AMM_FACTORY_ADDRESS ?? '',
                    },
                    GRAPH_URL,
                    web3,
                )
            } catch {
                console.log(userPosition)
            }
        })
        return userPositions
    }, [account, GRAPH_URL])
}
