import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { ProfileIdentifier } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { useCallback, useEffect, useState } from 'react'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { NFTAvatar, useNFTAvatar } from '../../../components/InjectedComponents/NFT/NFTAvatar'
import { activatedSocialNetworkUI } from '../../../social-network'
import { createReactRootShadowed, Flags, MaskMessage, NFTAvatarEvent, startWatch } from '../../../utils'
import {
    searchProfileAvatarSelector,
    searchProfileSaveSelector,
    searchProfileAvatarParentSelector,
} from '../utils/selector'
import { updateAvatarImage } from '../utils/updateAvatarImage'
import { getAvatar, getAvatarId, getTwitterId } from '../utils/user'

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

function useGetCurrentUserInfo(): { userId?: string; identifier?: ProfileIdentifier } | undefined {
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

interface NFTAvatarInTwitterProps {}

function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const useInfo = useGetCurrentUserInfo()

    const [twitterId, setTwitterId] = useState(getTwitterId())
    const avatar = useNFTAvatar(twitterId)
    const [avatarEvent, setAvatarEvent] = useState<NFTAvatarEvent>({} as NFTAvatarEvent)

    const onChange = useCallback(async (token: ERC721TokenDetailed) => {
        const parent = searchProfileAvatarParentSelector()
        if (!parent) return

        const avatarId = getAvatarId(getAvatar())
        setAvatarEvent({
            userId: twitterId,
            tokenId: token.tokenId,
            address: token.contractDetailed.address,
            image: token.info.image ?? '',
            avatarId,
            amount: '0',
        })

        updateAvatarImage(parent, token.info.image)
    }, [])

    const handler = () => {
        if (!avatarEvent) return
        MaskMessage.events.NFTAvatarUpdated.sendToLocal(avatarEvent)
    }

    useEffect(() => {
        if (!Flags.nft_avatar_enabled) return
        setTwitterId(getTwitterId())
        const parent = searchProfileAvatarParentSelector()
        if (parent && avatar) updateAvatarImage(parent, avatar.image)
    }, [avatar])

    useEffect(() => {
        if (!Flags.nft_avatar_enabled) return
        const profileSave = searchProfileSaveSelector().evaluate()
        if (!profileSave) return
        profileSave.addEventListener('click', handler)
        return () => profileSave.removeEventListener('click', handler)
    }, [handler])

    if (twitterId !== useInfo?.userId) return null
    if (!Flags.nft_avatar_enabled) return null
    return <NFTAvatar onChange={onChange} classes={classes} />
}
