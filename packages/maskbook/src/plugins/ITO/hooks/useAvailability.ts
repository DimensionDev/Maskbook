import { useAsyncRetry } from 'react-use'
import { useAccount } from '@dimensiondev/web3-shared'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useAvailability(id?: string, contract_address?: string) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract(contract_address)

    return useAsyncRetry(async () => {
        if (!id) return null
        if (!ITO_Contract) return null
        return ITO_Contract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, ITO_Contract])
}
