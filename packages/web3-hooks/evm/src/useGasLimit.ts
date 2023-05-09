import { useAsync } from 'react-use'
import { unreachable } from '@masknet/kit'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { Contract, Web3 } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useGasLimit(
    type?: SchemaType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
): AsyncState<number> {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsync(async () => {
        if (!recipient || type === undefined) return 0
        if ((type === SchemaType.ERC20 && !amount) || !contractAddress) return 0
        if ((type === SchemaType.ERC721 && !tokenId) || !contractAddress) return 0

        switch (type) {
            case SchemaType.Native:
                const gas = await Web3.estimateTransaction?.(
                    {
                        from: account,
                        to: recipient,
                        value: amount,
                    },
                    undefined,
                    {
                        chainId,
                    },
                )
                return Number.parseInt(gas ?? '0', 16)
            case SchemaType.ERC20:
                return Contract.getERC20Contract(contractAddress, {
                    chainId,
                })
                    ?.methods?.transfer(recipient, amount ?? 0)
                    .estimateGas({
                        from: account,
                    })
            case SchemaType.SBT:
            case SchemaType.ERC721:
                return Contract.getERC721Contract(contractAddress, {
                    chainId,
                })
                    ?.methods.transferFrom(account, recipient, tokenId ?? '')
                    .estimateGas({
                        from: account,
                    })
            case SchemaType.ERC1155:
                throw new Error('Method not implemented.')
            default:
                unreachable(type)
        }
    }, [chainId, type, amount, account, recipient, tokenId])
}
