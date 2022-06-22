import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { BindingProof, ECKeyIdentifier, EnhanceableSite } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PluginNFTAvatarRPC } from '../../messages'
import type { NextIDAvatarMeta, NFT_USAGE } from '../../types'

export function useSaveKV(pluginId: NetworkPluginID, chainId: ChainId) {
    const connection = useWeb3Connection<'all'>(pluginId)
    return useAsyncFn(
        async (
            info: NextIDAvatarMeta,
            account: string,
            persona: ECKeyIdentifier,
            proof: BindingProof,
            nftUsage: NFT_USAGE,
        ) => {
            const sign = await connection.signMessage(JSON.stringify(info), 'personalSign', {
                account,
            })
            return PluginNFTAvatarRPC.saveAvatar(
                account,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                info,
                sign,
                nftUsage,
            )
        },
        [connection],
    )
}
