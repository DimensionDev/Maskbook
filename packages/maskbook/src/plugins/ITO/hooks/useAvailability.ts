import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useAvailability(id?: string) {
    const from = useAccount()
    const ITO_Contract = useITO_Contract()

    return useAsyncRetry(async () => {
        if (!id) return null
        if (!ITO_Contract) return null
        return ITO_Contract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, ITO_Contract])
}
