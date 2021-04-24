import { createContainer } from 'unstated-next'
import { useAccount } from '../hooks/useAccount'
import { useChainId, useChainIdValid } from '../hooks/useChainId'
import { useBlockNumber } from '../hooks/useBlockNumber'
import { useNativeTokenDetailed } from '../hooks/useNativeTokenDetailed'

function useChainState() {
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const blockNumber = useBlockNumber(chainId)
    const chainTokenDetailed = useNativeTokenDetailed()
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
