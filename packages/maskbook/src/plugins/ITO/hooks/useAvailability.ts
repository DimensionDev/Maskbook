import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { useMaskITO_Contract } from '../contracts/useMaskITO_Contract'
import type { MaskITO } from '../../../contracts/MaskITO'

export function useAvailability(id?: string, isMask?: boolean) {
    const from = useAccount()
    const ITO_Contract = useITO_Contract()
    const MaskITO_Contract = useMaskITO_Contract()
    const contract = isMask ? MaskITO_Contract : ITO_Contract

    return useAsyncRetry(async () => {
        if (!id) return null
        if (!contract) return null
        let availability = await contract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })

        if (isMask) {
            const unlockTime = await (contract as MaskITO).methods.getUnlockTime().call({
                from,
            })

            return { unlockTime, ...availability }
        }
        return { unlockTime: undefined, ...availability }
    }, [id, from, ITO_Contract])
}
