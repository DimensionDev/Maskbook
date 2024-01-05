import { useQuery } from '@tanstack/react-query'
import type { AbiItem } from 'web3-utils'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from '@masknet/web3-providers'

/** address in url is not the one of the contract */
export function useNFTXAssetAddress(address: string, enabled: boolean) {
    return useQuery({
        enabled,
        queryKey: ['nftx', 'asset-address', address],
        queryFn: async () => {
            const ABI = [
                {
                    constant: true,
                    inputs: [],
                    name: 'assetAddress',
                    outputs: [
                        {
                            name: '',
                            type: 'address',
                        },
                    ],
                    payable: false,
                    stateMutability: 'view',
                    type: 'function',
                },
            ]
            const contract = EVMContractReadonly.getWeb3Contract(address, ABI as AbiItem[], {
                chainId: ChainId.Mainnet,
            })
            const assetAddress: string = await contract?.methods.assetAddress().call()
            return assetAddress
        },
    })
}
