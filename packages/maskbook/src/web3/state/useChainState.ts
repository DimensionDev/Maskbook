import { createContainer } from 'unstated-next'
import { useAccount } from '../hooks/useAccount'
import { useChainId, useChainIdValid } from '../hooks/useChainId'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { useNativeTokenDetailed } from '../hooks/useNativeTokenDetailed'

function useChainState() {
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const nativeTokenDetailed = useNativeTokenDetailed()
    const nativeTokenBalance = useNativeTokenBalance(account)

    return {
        account,
        chainId,
        chainIdValid,
        nativeTokenBalance,
        nativeTokenDetailed,
        erc20TokenDetaileds: [],
        erc721TokenDetaileds: [],
    }
}

export const ChainState = createContainer(useChainState)
