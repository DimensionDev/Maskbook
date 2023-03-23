import type { NextIDAvatarMeta } from '@masknet/plugin-avatar'
import { searchTwitterAvatarLinkSelector } from '../../utils/selector.js'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useUpdateEffect } from 'react-use'

export function useUpdatedAvatar(showAvatar: boolean, nftAvatar?: NextIDAvatarMeta) {
    useUpdateEffect(() => {
        if (!showAvatar) return

        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!linkParentDom) return

        const handler = (event: MouseEvent) => {
            if (!nftAvatar?.tokenId || !nftAvatar?.address) return
            event.stopPropagation()
            event.preventDefault()
            if (!nftAvatar.pluginId || !nftAvatar.chainId) return
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

        const clean = () => {
            linkParentDom.removeEventListener('click', handler, true)
        }

        if (!nftAvatar) {
            clean()
            return
        }

        linkParentDom.addEventListener('click', handler, true)

        return clean
    }, [nftAvatar, showAvatar])
}
