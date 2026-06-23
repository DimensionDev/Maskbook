import { useQuery } from '@tanstack/react-query'
import { unreachable } from '@masknet/kit'
import { toHex, type NetworkPluginID } from '@masknet/shared-base'
import { EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworks } from '@masknet/web3-hooks-base'
import type { Address } from 'viem'

export function useGasLimit(
    schemaType?: SchemaType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
    expectedChainId?: ChainId,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const networks = useNetworks()
    const network = networks.find((x) => x.chainId === chainId)
    const options = {
        chainId,
        providerURL: network?.rpcUrl,
    }

    return useQuery({
        queryKey: ['gas-limit', chainId, schemaType, account, recipient, tokenId, amount, contractAddress],
        queryFn: async () => {
            if (!recipient || schemaType === undefined) return 0
            if ((schemaType === SchemaType.ERC20 && !amount) || !contractAddress) return 0
            if ((schemaType === SchemaType.ERC721 && !tokenId) || !contractAddress) return 0

            switch (schemaType) {
                case SchemaType.Native:
                    const gas = await EVMWeb3.estimateTransaction?.(
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
                    return (
                        (await EVMContract.estimateContractGas(
                            EVMContract.getERC20Contract(contractAddress, options),
                            'transfer',
                            [recipient as Address, BigInt(toHex(amount ?? 0))],
                            {
                                ...options,
                                from: account,
                            },
                        )) || null
                    )
                case SchemaType.SBT:
                case SchemaType.ERC721:
                    return (
                        (await EVMContract.estimateContractGas(
                            EVMContract.getERC721Contract(contractAddress, options),
                            'transferFrom',
                            [account as Address, recipient as Address, BigInt(tokenId ?? 0)],
                            {
                                ...options,
                                from: account,
                            },
                        )) || null
                    )
                case SchemaType.ERC1155:
                    throw new Error('Method not implemented.')
                default:
                    unreachable(schemaType)
            }
        },
    })
}
