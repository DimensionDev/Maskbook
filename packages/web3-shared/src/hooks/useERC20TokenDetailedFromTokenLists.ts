import { useAsync } from 'react-use'
import { useWeb3Context } from '../context'
import { useChainId } from './useChainId'
import { isSameAddress } from '../utils'
import { useEthereumConstants } from '../constants'

export function useERC20TokenDetailedFromTokenLists(address?: string) {
    const { ERC20_TOKEN_LISTS } = useEthereumConstants()
    const chainId = useChainId()
    const { fetchERC20TokensFromTokenLists } = useWeb3Context()
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
        async () =>
            !ERC20_TOKEN_LISTS || ERC20_TOKEN_LISTS.length === 0
                ? []
                : fetchERC20TokensFromTokenLists(ERC20_TOKEN_LISTS, chainId),
        [chainId, ERC20_TOKEN_LISTS?.sort().join()],
    )

    return {
        loading: loadingAllTokens,
        tokensDetailed: allTokens.find((token) => isSameAddress(address, token.address)),
    }
}
