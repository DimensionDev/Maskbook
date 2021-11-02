import { useAsyncRetry } from 'react-use'
import type BigNumber from 'bignumber.js'
import { useAccount } from '@masknet/web3-shared-evm'
import { useAirdropContract } from '../contracts/useAirdropContract'

export function useAvailability(index: string, amount: BigNumber, proof: string[]) {
    const account = useAccount()
    const AirdropContract = useAirdropContract()

    return useAsyncRetry(async () => {
        if (!AirdropContract) return null
        return AirdropContract.methods.check(index, account, amount.toFixed(), proof).call({
            from: account,
        })
    }, [index, account, amount, proof, AirdropContract])
}
