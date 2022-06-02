import type { BindingProof, ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PluginNFTAvatarRPC } from '../../messages'
import type { NextIDAvatarMeta } from '../../types'

export function useSaveSolana() {
    return useAsyncFn(
        async (
            info: NextIDAvatarMeta,
            account: string,
            persona: ECKeyIdentifier,
            identifier: ProfileIdentifier,
            proof: BindingProof,
        ) => {
            return PluginNFTAvatarRPC.saveAvatar(
                info.pluginId ?? NetworkPluginID.PLUGIN_SOLANA,
                account,
                activatedSocialNetworkUI.networkIdentifier,
                info,
            )
        },
        [],
    )
}
