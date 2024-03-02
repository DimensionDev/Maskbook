import { useWeb3Connection } from '@masknet/web3-hooks-base'
import {
    type BindingProof,
    type ECKeyIdentifier,
    type NetworkPluginID,
    getEnhanceableSiteType,
} from '@masknet/shared-base'
import type { NextIDAvatarMeta } from '../types.js'
import { useSaveAvatar } from './useSaveAvatar.js'
import { useAsyncFn } from 'react-use'

export function useSaveKV(pluginID: NetworkPluginID) {
    const Web3 = useWeb3Connection(pluginID)
    const [, saveAvatar] = useSaveAvatar(pluginID)

    return useAsyncFn(
        async (info: NextIDAvatarMeta, account: string, persona: ECKeyIdentifier, proof: BindingProof) => {
            const siteType = getEnhanceableSiteType()
            if (!siteType) return

            const sign = await Web3.signMessage('message', JSON.stringify(info), {
                account,
            })

            return saveAvatar(account, siteType, info, sign)
        },
        [Web3, saveAvatar],
    )
}
