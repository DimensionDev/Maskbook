import { Token, EthereumTokenType } from '../types'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import { useChainId } from './useChainState'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useTokenBalance(token?: PartialRequired<Token, 'address'>) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const chainId = useChainId()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(token?.address ?? ETH_ADDRESS)
    return useAsync(async () => {
        if (!account) return '0'
        if (!token?.address) return '0'

        // Ether
        if (token.type === EthereumTokenType.Ether)
            return Services.Ethereum.getBalance(account, await Services.Ethereum.getChainId(account))

        // ERC20
        if (token.type === EthereumTokenType.ERC20) {
            if (erc20Contract) return erc20Contract.methods.balanceOf(account).call()
            return '0'
        }

        // TOOD:
        // ERC721
        return '0'
    }, [account, token?.type, token?.address, erc20Contract, chainId /* re-calc when switch the chain */])
}
