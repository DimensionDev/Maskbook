import { EthereumTokenType, Token } from '../types'
import { useConstant } from './useConstant'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAsync } from 'react-use'
import { useAccount } from './useAccount'
import { CONSTANTS } from '../constants'

export function useTokenAllowance(token?: PartialRequired<Token, 'address'>, spender?: string) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(token?.address ?? ETH_ADDRESS)
    return useAsync(async () => {
        if (!account) return
        if (!spender) return
        if (!erc20Contract) return
        if (token?.type !== EthereumTokenType.ERC20) return '0'
        return erc20Contract.methods.allowance(account, spender).call()
    }, [account, spender, token?.type, erc20Contract])
}
