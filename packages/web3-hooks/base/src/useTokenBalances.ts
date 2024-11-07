import { EVMContractReadonly } from '@masknet/web3-providers'
import { getEthereumConstant, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useTokenBalances(chainId: ChainId, account: string, tokenAddresses: string[]) {
    return useQuery({
        queryKey: ['token-balances', account, tokenAddresses],
        queryFn: async () => {
            if (!tokenAddresses.length) return null
            const address = getEthereumConstant(chainId, 'BALANCE_CHECKER_ADDRESS')
            const contract = EVMContractReadonly.getBalanceCheckerContract(address, { chainId })
            if (!contract) return null

            const balances = await contract.methods.balances([account], tokenAddresses).call()
            if (balances.length !== tokenAddresses.length) return null
            const map = new Map<string, string>()
            tokenAddresses.forEach((address, i) => {
                map.set(address, balances[i])
            })
            return map
        },
    })
}
