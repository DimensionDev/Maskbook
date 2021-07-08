import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared'
import type { ITO2 } from '@masknet/contracts/types/ITO2'
import { useITO_Contract } from './useITO_Contract'

export function useAvailability(id?: string, contract_address?: string) {
    const account = useAccount()
    const { contract: ITO_Contract } = useITO_Contract(contract_address)

    return useAsyncRetry(async () => {
        if (!id) return null
        if (!ITO_Contract) return null
        return (ITO_Contract as ITO2).methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, ITO_Contract])
}
