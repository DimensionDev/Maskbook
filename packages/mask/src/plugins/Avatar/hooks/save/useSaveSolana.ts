import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { BindingProof, ECKeyIdentifier, EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PluginNFTAvatarRPC } from '../../messages'
import type { NextIDAvatarMeta } from '../../types'

export function useSaveSolana(pluginId: NetworkPluginID, chainId: ChainId) {
    const connection = useWeb3Connection<'all'>(pluginId)
    return useAsyncFn(
        async (
            info: NextIDAvatarMeta,
            account: string,
            persona: ECKeyIdentifier,
            identifier: ProfileIdentifier,
            proof: BindingProof,
        ) => {
            try {
                console.log('---------------------------')
                console.log(info)
                const sign = await connection.signMessage(JSON.stringify(info), 'personalSign', {
                    account,
                })
                console.log(sign)
                return PluginNFTAvatarRPC.saveAvatar(
                    account,
                    activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                    info,
                    sign,
                )
            } catch (error) {
                console.log(error)
                return
            }
        },
        [connection],
    )
}
