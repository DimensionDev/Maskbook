import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { delay, ProfileIdentifier } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { useCallback, useEffect, useState } from 'react'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'
import { NFTAvatar } from '../../../../components/InjectedComponents/NFT/NFTAvatar'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { createReactRootShadowed, downloadUrl, Flags, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import {
    searchProfileAvatarSelector,
    searchProfileCloseSelector,
    searchProfileSaveSelector,
} from '../../utils/selector'
import { hookInputUploadOnce } from '@masknet/injected-script'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'

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

function useCurrentUserInfo(): { userId?: string; identifier?: ProfileIdentifier } | undefined {
    const personas = useMyPersonas()
    if (personas.length === 0) return undefined
    const userInfo = personas
        .map((persona) => {
            const profiles = persona ? [...persona.linkedProfiles] : []
            const profile = profiles.find(([key, value]) => key.network === activatedSocialNetworkUI.networkIdentifier)
            return {
                userId: profile?.[0].userId,
                identifier: profile?.[0],
            }
        })
        .filter((x) => x)

    return userInfo?.[0]
}

export async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(await blobToArrayBuffer(image)))
    setTimeout(() => {
        ;(
            document.querySelectorAll(`input[data-testid="fileInput"]`)[1]?.parentElement?.children[0] as HTMLElement
        )?.click()
    }, 50)
}

interface NFTAvatarInTwitterProps {}

function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const useInfo = useCurrentUserInfo()
    const identity = useCurrentVisitingIdentity()
    const [avatarEvent, setAvatarEvent] = useState<NFTAvatarEvent>({} as NFTAvatarEvent)

    const onChange = useCallback(async (token: ERC721TokenDetailed) => {
        if (!token.info.image) return
        const image = await downloadUrl(token.info.image)
        changeImageToActiveElements(image)

        setAvatarEvent({
            ...token,
            userId: identity.identifier.userId,
            avatarId: 'unknown',
        })
    }, [])

    const handler = async () => {
        if (!avatarEvent) return
        await delay(500)
        MaskMessage.events.NFTAvatarUpdated.sendToLocal(avatarEvent)
    }

    useEffect(() => {
        if (!Flags.nft_avatar_enabled) return
        const profileSave = searchProfileSaveSelector().evaluate()
        if (!profileSave) return
        profileSave.addEventListener('click', handler)
        return () => profileSave.removeEventListener('click', handler)
    }, [handler])

    useEffect(() => {
        const closeNode = searchProfileCloseSelector().evaluate()
        if (!closeNode) return
        closeNode.addEventListener('click', () => {})

        return () => closeNode.removeEventListener('click', () => {})
    })

    if (identity.identifier.userId !== useInfo?.userId) return null
    if (!Flags.nft_avatar_enabled) return null
    return <NFTAvatar onChange={onChange} classes={classes} />
}
