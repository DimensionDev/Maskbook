import { useAsyncRetry } from 'react-use'
import type { MaskITO } from '@dimensiondev/contracts/types/MaskITO'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useMaskITO_Packet() {
    const account = useAccount()
    const ITO_CONTRACT = useITO_Contract(true) as MaskITO | null

    return useAsyncRetry(async () => {
        if (!ITO_CONTRACT) return
        const [unlockTime, claimable = '0'] = await Promise.all([
            ITO_CONTRACT.methods.getUnlockTime().call(),
            ITO_CONTRACT.methods.check_claimable().call({
                from: account,
            }),
        ])
        return {
            unlockTime,
            claimable,
        }
    }, [account, ITO_CONTRACT])
}
