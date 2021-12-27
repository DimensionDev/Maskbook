import { useAsync } from 'react-use'
import { useWeb3Context } from '../context'
import { useChainId } from './useChainId'
import { isSameAddress } from '../utils'
import { useTokenListConstants } from '../constants'

export function useERC20TokenDetailedFromTokenLists(address?: string) {
    const { ERC20 } = useTokenListConstants()
    const chainId = useChainId()
    const { fetchERC20TokensFromTokenLists } = useWeb3Context()
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
        async () => (!ERC20 || ERC20.length === 0 ? [] : fetchERC20TokensFromTokenLists(ERC20, chainId)),
        [chainId, ERC20?.sort().join()],
    )

    return {
        loading: loadingAllTokens,
        tokensDetailed: allTokens.find((token) => isSameAddress(address, token.address)),
    }
}
