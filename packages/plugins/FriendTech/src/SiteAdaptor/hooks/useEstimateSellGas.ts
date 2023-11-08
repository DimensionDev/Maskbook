import { EVMContractReadonly } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { FRIEND_TECH_CONTRACT_ADDRESS } from '../../constants.js'

export function useEstimateSellGas(subjectAddress: string, myAddress: string, count: string) {
    return useQuery({
        queryKey: ['friend-tech', 'sell-gas', subjectAddress, myAddress, count],
        refetchInterval: 10,
        queryFn: async () => {
            if (!count) return 0
            const contract = EVMContractReadonly.getFriendTech(FRIEND_TECH_CONTRACT_ADDRESS, {
                chainId: ChainId.Base,
            })
            const gas = await contract?.methods.sellShares(subjectAddress, count).estimateGas({
                from: myAddress,
            })
            return gas
        },
    })
}
