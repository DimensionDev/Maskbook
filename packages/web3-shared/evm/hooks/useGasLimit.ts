import { EthereumTokenType } from '../types'
import { useERC20TokenContract, useERC721TokenContract } from '../contracts'
import { useAccount } from './useAccount'
import { useWeb3 } from './useWeb3'
import { useAsync } from 'react-use'
import { unreachable } from '@dimensiondev/kit'

export function useGasLimit(
    type?: EthereumTokenType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
) {
    const web3 = useWeb3()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(contractAddress)
    const erc721Contract = useERC721TokenContract(contractAddress)

    return useAsync(async () => {
        if (!recipient || type === undefined) return 0
        if ((type === EthereumTokenType.ERC20 && !amount) || !contractAddress) return 0
        if ((type === EthereumTokenType.ERC721 && !tokenId) || !contractAddress) return 0

        switch (type) {
            case EthereumTokenType.Native:
                return web3.eth.estimateGas({
                    from: account,
                    to: recipient,
                    value: amount,
                })
            case EthereumTokenType.ERC20:
                return erc20Contract?.methods.transfer(recipient, amount ?? 0).estimateGas({
                    from: account,
                })
            case EthereumTokenType.ERC721:
                return erc721Contract?.methods.transferFrom(account, recipient, tokenId ?? '').estimateGas({
                    from: account,
                })
            case EthereumTokenType.ERC1155:
                throw new Error('To be implemented')
            default:
                unreachable(type)
        }
    }, [erc20Contract, type, amount, account, recipient, tokenId])
}
