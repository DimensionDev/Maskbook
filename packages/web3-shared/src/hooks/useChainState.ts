import { useSubscription } from 'use-subscription'
import { useWeb3Provider } from '../context/provider'
import CHAINS from '../assets/chains.json'

export function useChainState() {
    const _ = useWeb3Provider()
    const account = useSubscription(_.account)
    const allowTestChain = useSubscription(_.allowTestChain)
    const blockNumber = useSubscription(_.blockNumber)
    const providerType = useSubscription(_.providerType)
    const networkType = useSubscription(_.networkType)
    const wallets = useSubscription(_.wallets)
    const chainId = useSubscription(_.chainId)
    const chainDetailed = CHAINS.find((x) => x.chainId === chainId)
    return {
        account,
        blockNumber,
        providerType,
        networkType,
        wallets,
        chainId,
        chainDetailed,
        chainIdValid: !account || allowTestChain || chainDetailed?.network === 'mainnet',
    }
}
