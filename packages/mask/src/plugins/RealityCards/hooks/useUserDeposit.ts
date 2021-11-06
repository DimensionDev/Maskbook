import { useAccount } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { useTreasuryContract } from '../contracts/useTreasuryContract'

export function useUserDeposit() {
    const account = useAccount()
    const contract = useTreasuryContract()

    return useAsyncRetry(async () => {
        if (!contract || !account) return undefined
        const userDeposit = await contract.methods.userDeposit(account).call()
        return userDeposit
    }, [contract, account])
}
