import { createContainer } from 'unstated-next'
import { useAccount } from '../hooks/useAccount'
import { useBlockNumber, useChainId, useChainIdValid } from '../hooks/useBlockNumber'
import { useEtherTokenDetailed } from '../hooks/useEtherTokenDetailed'

function useChainState() {
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const blockNumber = useBlockNumber(chainId)
    const chainTokenDetailed = useEtherTokenDetailed()
    return {
        account,
        chainId,
        chainIdValid,
        blockNumber,
        chainTokenDetailed,
        erc20TokenDetaileds: [],
        erc721TokenDetaileds: [],
    }
}

export const ChainState = createContainer(useChainState)
