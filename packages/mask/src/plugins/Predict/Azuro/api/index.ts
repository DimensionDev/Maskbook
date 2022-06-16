import { fetchGames, fetchUserBets, setSelectedChainId, setContractAddresses } from '@azuro-protocol/sdk'
import type { ChainId } from '@masknet/web3-shared-evm'
import { contractAddresses } from '../../constants'

export async function fetchMyBets(account: string, chainId: ChainId) {
    setSelectedChainId(chainId)
    setContractAddresses(contractAddresses[chainId])

    const bets = await fetchUserBets({ account })
    return bets
}

export async function fetchEvents(chainId: ChainId) {
    setSelectedChainId(chainId)
    setContractAddresses(contractAddresses[chainId])

    const events = await fetchGames({
        filters: {
            resolved: false,
            canceled: false,
        },
    })
    console.log('events: ', events)

    return events
}
