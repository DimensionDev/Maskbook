import { useUpdateEffect } from 'react-use'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { CrossIsolationMessages, type NetworkPluginID } from '@masknet/shared-base'
import { searchTwitterAvatarLinkSelector } from '../../utils/selector.js'

export function useUpdatedAvatar(showAvatar: boolean, nftAvatar: AvatarNextID<NetworkPluginID> | null) {
    useUpdateEffect(() => {
        if (!showAvatar) return

        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!linkParentDom) return

        const handler = (event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()
            if (!nftAvatar?.tokenId || !nftAvatar?.address || !nftAvatar.pluginId || !nftAvatar.chainId) return
            CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
                open: true,
                pluginID: nftAvatar.pluginId,
                chainId: nftAvatar.chainId,
                tokenId: nftAvatar.tokenId,
                tokenAddress: nftAvatar.address,
                ownerAddress: nftAvatar.ownerAddress,
                origin: 'pfp',
            })
        }

        if (!nftAvatar) return

        linkParentDom.addEventListener('click', handler, true)
        return () => linkParentDom.removeEventListener('click', handler, true)
    }, [nftAvatar, showAvatar])
}
