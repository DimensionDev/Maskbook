import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useMaskITO_Contract } from './useMaskITO_Contract.js'

export function useMaskITO_Packet() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const MaskITO_Contract = useMaskITO_Contract(chainId)
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
