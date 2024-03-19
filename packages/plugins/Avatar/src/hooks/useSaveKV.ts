import { useAsyncFn } from 'react-use'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import {
    type BindingProof,
    type ECKeyIdentifier,
    type NetworkPluginID,
    getEnhanceableSiteType,
} from '@masknet/shared-base'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { useSaveAvatar } from './useSaveAvatar.js'

export function useSaveKV(pluginID: NetworkPluginID) {
    const Web3 = useWeb3Connection(pluginID)
    const [, saveAvatar] = useSaveAvatar(pluginID)

    return useAsyncFn(
        async (info: AvatarNextID<NetworkPluginID>, account: string, persona: ECKeyIdentifier, proof: BindingProof) => {
            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const sign = await Web3.signMessage('message', JSON.stringify(info), {
                account,
            })
            return saveAvatar(siteType, account, info, sign)
        },
        [Web3, saveAvatar],
    )
}
