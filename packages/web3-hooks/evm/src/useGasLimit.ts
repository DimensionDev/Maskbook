import { useAsync } from 'react-use'
import { unreachable } from '@masknet/kit'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { useERC20TokenContract } from './useERC20TokenContract.js'
import { useERC721TokenContract } from './useERC721TokenContract.js'

export function useGasLimit(
    type?: SchemaType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
): AsyncState<number> {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const erc20Contract = useERC20TokenContract(chainId, contractAddress)
    const erc721Contract = useERC721TokenContract(chainId, contractAddress)

    return useAsync(async () => {
        if (!web3 || !recipient || type === undefined) return 0
        if ((type === SchemaType.ERC20 && !amount) || !contractAddress) return 0
        if ((type === SchemaType.ERC721 && !tokenId) || !contractAddress) return 0

        switch (type) {
            case SchemaType.Native:
                return web3.eth.estimateGas({
                    from: account,
                    to: recipient,
                    value: amount,
                })
            case SchemaType.ERC20:
                return erc20Contract?.methods.transfer(recipient, amount ?? 0).estimateGas({
                    from: account,
                })
            case SchemaType.SBT:
            case SchemaType.ERC721:
                return erc721Contract?.methods.transferFrom(account, recipient, tokenId ?? '').estimateGas({
                    from: account,
                })
            case SchemaType.ERC1155:
                throw new Error('To be implemented')
            default:
                unreachable(type)
        }
    }, [erc20Contract, type, amount, account, recipient, tokenId])
}
