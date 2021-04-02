import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'
import type { MaskITO } from '@dimensiondev/contracts/types/MaskITO'

export function useAvailability(id?: string, isMask?: boolean) {
    const from = useAccount()
    const ITO_Contract = useITO_Contract(isMask ?? false)

    return useAsyncRetry(async () => {
        if (!id) return null
        if (!ITO_Contract) return null
        const availability = await ITO_Contract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })

        if (isMask) {
            const unlockTime = await (ITO_Contract as MaskITO).methods.getUnlockTime().call({
                from,
            })

            return { unlockTime, ...availability }
        }
        return { unlockTime: undefined, ...availability }
    }, [id, from, ITO_Contract])
}
