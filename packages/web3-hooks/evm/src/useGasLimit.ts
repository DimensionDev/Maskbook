import { useQuery } from '@tanstack/react-query'
import { unreachable } from '@masknet/kit'
import { Contract, Web3 } from '@masknet/web3-providers'
import { type NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useGasLimit(
    schemaType?: SchemaType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
    expectedChainId?: ChainId,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const options = {
        chainId,
    }

    return useQuery({
        queryKey: ['gas-limit', chainId, schemaType, account, recipient, tokenId, amount],
        queryFn: async () => {
            if (!recipient || schemaType === undefined) return 0
            if ((schemaType === SchemaType.ERC20 && !amount) || !contractAddress) return 0
            if ((schemaType === SchemaType.ERC721 && !tokenId) || !contractAddress) return 0

            switch (schemaType) {
                case SchemaType.Native:
                    const gas = await Web3.estimateTransaction?.(
                        {
                            from: account,
                            to: recipient,
                            value: amount,
                        },
                        undefined,
                        options,
                    )
                    return Number.parseInt(gas ?? '0', 16)
                case SchemaType.ERC20:
                    return Contract.getERC20Contract(contractAddress, options)
                        ?.methods?.transfer(recipient, amount ?? 0)
                        .estimateGas({
                            from: account,
                        })
                case SchemaType.SBT:
                case SchemaType.ERC721:
                    return Contract.getERC721Contract(contractAddress, options)
                        ?.methods.transferFrom(account, recipient, tokenId ?? '')
                        .estimateGas({
                            from: account,
                        })
                case SchemaType.ERC1155:
                    throw new Error('Method not implemented.')
                default:
                    unreachable(schemaType)
            }
        },
    })
}
