import { Token, EthereumTokenType } from '../types'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'
import { useChainId } from './useChainState'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useTokenBalance(token?: PartialRequired<Token, 'address'>) {
    const chainId = useChainId()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(token?.address ?? '')
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsyncRetry(async () => {
        if (!account) return '0'
        if (!token?.address) return '0'
        switch (token.type) {
            case EthereumTokenType.Ether:
                return Services.Ethereum.getBalance(account, await Services.Ethereum.getChainId(account))
            case EthereumTokenType.ERC20:
                if (erc20Contract) return erc20Contract.methods.balanceOf(account).call()
                return '0'
            case EthereumTokenType.ERC721:
                if (erc721Contract) return erc721Contract.methods.balanceOf(account).call()
                return '0'
            default:
                return '0'
        }
    }, [account, chainId /* re-calc when switch the chain */, token?.address, token?.type, erc20Contract])
}
