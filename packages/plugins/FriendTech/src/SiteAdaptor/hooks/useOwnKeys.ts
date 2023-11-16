import { EVMContractReadonly } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { FRIEND_TECH_CONTRACT_ADDRESS } from '../../constants.js'
import { BigNumber } from 'bignumber.js'
import { ChainId } from '@masknet/web3-shared-evm'

export function useOwnKeys(subjectAddress: string, myAddress: string) {
    return useQuery({
        queryKey: ['friend-tech', 'own-keys', subjectAddress, myAddress],
        queryFn: async () => {
            const contract = EVMContractReadonly.getFriendTech(FRIEND_TECH_CONTRACT_ADDRESS, {
                chainId: ChainId.Base,
            })
            const count = await contract?.methods.sharesBalance(subjectAddress, myAddress).call()
            if (!count) return 0
            return new BigNumber(count).toNumber()
        },
    })
}
