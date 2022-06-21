import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { BindingProof, ECKeyIdentifier, EnhanceableSite } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PluginNFTAvatarRPC } from '../../messages'
import { getAvatar } from '../../Services'
import { AllNextIDAvatarMeta, NextIDAvatarMeta, NFT_USAGE } from '../../types'

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
            const _tokenInfo = await getAvatar(
                info.userId,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            )

            let tokenInfo: AllNextIDAvatarMeta
            if (nftUsage === NFT_USAGE.NFT_PFP) {
                tokenInfo = info
                if (_tokenInfo?.background) {
                    tokenInfo = Object.assign(info, { background: _tokenInfo.background })
                }
            } else {
                if (_tokenInfo) {
                    tokenInfo = Object.assign(_tokenInfo, { background: info })
                } else {
                    tokenInfo = Object.assign({ ...info, avatarId: '', address: '', tokenId: '' }, { background: info })
                }
            }

            const sign = await connection.signMessage(JSON.stringify(tokenInfo), 'personalSign', {
                account,
            })
            return PluginNFTAvatarRPC.saveAvatar(
                account,
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                tokenInfo,
                sign,
                nftUsage,
            )
        },
        [connection],
    )
}
