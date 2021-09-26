import { EthereumTokenType } from '../types'
import { useERC20TokenContract } from '../contracts'
import { useAccount, useWeb3 } from '.'
import { useAsync } from 'react-use'
import { unreachable } from '@dimensiondev/kit'

export function useGasLimit(type?: EthereumTokenType, address?: string, amount?: string, recipient?: string) {
    const web3 = useWeb3()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)

    return useAsync(async () => {
        if (!recipient || !amount || type === undefined) return 0
        switch (type) {
            case EthereumTokenType.Native:
                return web3.eth.estimateGas({
                    from: account,
                    to: recipient,
                    value: amount,
                })
            case EthereumTokenType.ERC20:
                return erc20Contract?.methods.transfer(recipient, amount).estimateGas({
                    from: account,
                })
            case EthereumTokenType.ERC721:
            case EthereumTokenType.ERC1155:
                throw new Error('To be implemented')
            default:
                unreachable(type)
        }
    }, [erc20Contract, type, amount, account, recipient])
}
