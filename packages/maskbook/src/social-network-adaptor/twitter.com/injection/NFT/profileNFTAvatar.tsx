import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useCallback, useEffect, useState } from 'react'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { createReactRootShadowed, Flags, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import {
    searchAvatarOpenFileSelector,
    searchProfileAvatarSelector,
    searchProfileSaveSelector,
} from '../../utils/selector'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../utils/user'
import { toPNG } from '../../../../plugins/Avatar/utils'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { useCurrentProfileIdentifier } from '../../../../plugins/Avatar/hooks/useCurrentUserInfo'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { hookInputUploadOnce } from '@masknet/injected-script'

export async function injectProfileNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: '11px 14px 11px 14px',
    },
}))

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(await blobToArrayBuffer(image)))
    setTimeout(() => {
        ;(searchAvatarOpenFileSelector().evaluate()[0]?.parentElement?.children[0] as HTMLElement)?.click()
    }, 50)
}

interface NFTAvatarInTwitterProps {}

function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const currentIdentifier = useCurrentProfileIdentifier()
    const identity = useCurrentVisitingIdentity()
    const [avatarEvent, setAvatarEvent] = useState<NFTAvatarEvent>({} as NFTAvatarEvent)

    const onChange = useCallback(async (token: ERC721TokenDetailed) => {
        if (!token.info.image) return
        const image = await toPNG(token.info.image)
        if (!image) return
        changeImageToActiveElements(image)

        setAvatarEvent({
            userId: identity.identifier.userId,
            avatarId: getAvatarId(identity.avatar ?? ''),
            address: token.contractDetailed.address,
            tokenId: token.tokenId,
        })
    }, [])

    const handler = () => {
        if (!avatarEvent) return
        MaskMessage.events.NFTAvatarUpdated.sendToLocal(avatarEvent)
    }

    useEffect(() => {
        if (!Flags.nft_avatar_enabled) return
        const profileSave = searchProfileSaveSelector().evaluate()
        if (!profileSave) return
        profileSave.addEventListener('click', handler)
        return () => profileSave.removeEventListener('click', handler)
    }, [handler])

    if (identity.identifier.userId !== currentIdentifier?.userId) return null
    if (!Flags.nft_avatar_enabled) return null
    return <NFTAvatar onChange={onChange} classes={classes} />
}
