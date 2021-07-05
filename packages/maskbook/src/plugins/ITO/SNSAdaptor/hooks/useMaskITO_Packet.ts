import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared'
import { useMaskITO_Contract } from './useMaskITO_Contract'

export function useMaskITO_Packet() {
    const account = useAccount()
    const MaskITO_Contract = useMaskITO_Contract()
    return useAsyncRetry(async () => {
        if (!MaskITO_Contract) return
        const [unlockTime, claimable = '0'] = await Promise.all([
            MaskITO_Contract.methods.getUnlockTime().call(),
            MaskITO_Contract.methods.check_claimable().call({
                from: account,
            }),
        ])
        return {
            unlockTime,
            claimable,
        }
    }, [account, MaskITO_Contract])
}
