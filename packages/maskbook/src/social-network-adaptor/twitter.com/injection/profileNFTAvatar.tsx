import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { ProfileIdentifier } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { NFTAvatar } from '../../../components/InjectedComponents/NFTAvatar'
import Services from '../../../extension/service'
import { gun2 } from '../../../network/gun/version.2'
import { activatedSocialNetworkUI } from '../../../social-network'
import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import {
    searchAvatarSelector,
    searchAvatarSelectorImage,
    searchAvatarSelectorInput,
    searchProfileSaveSelector,
} from '../utils/selector'
import { getTwitterId } from '../utils/user'

export function injectProfileNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

export interface AvatarMetaData {
    twitterId: string
    tokenId: string
    amount: string
    image?: string
    address: string
}

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2, 2, 0, 2),
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

function NFTAvatarInTwitter() {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const useInfo = useGetCurrentUserInfo()
    const avatar = useNFTAvatar(twitterId)
    const profileSave = searchProfileSaveSelector().evaluate()
    const [avatarMeta, setAvatarMeta] = useState<AvatarMetaData>({} as AvatarMetaData)
    const onChange = useCallback(async (token: ERC721TokenDetailed, amount: string) => {
        UpdateAvatar(token.info.image ?? '')
        const metaData = {
            twitterId,
            amount,
            tokenId: token.tokenId,
            address: token.contractDetailed.address,
            image: token.info.image ?? '',
        }
        setAvatarMeta(metaData)
    }, [])

    useEffect(() => {
        profileSave?.addEventListener('click', () => MaskMessage.events.NFTAvatarUpdated.sendToLocal(avatarMeta))
        return () =>
            profileSave?.removeEventListener('click', () => MaskMessage.events.NFTAvatarUpdated.sendToLocal(avatarMeta))
    }, [profileSave, avatarMeta])

    useEffect(() => {
        UpdateAvatar(avatar?.image ?? '')
    }, [avatar])

    if (twitterId !== useInfo?.userId) return null
    return <NFTAvatar onChange={onChange} classes={classes} />
}

async function UpdateAvatar(image: string) {
    const blob = await Services.Helper.fetch(image)
    if (!blob) return
    const blobURL = URL.createObjectURL(blob)
    const avatarInput = searchAvatarSelectorInput().evaluate()[0]
    if (!avatarInput) return
    avatarInput.style.backgroundImage = `url("${blobURL.toString()}")`
    const avatarImage = searchAvatarSelectorImage().evaluate()[0]
    if (!avatarImage) return
    avatarImage.setAttribute('src', blobURL.toString())
}

export function useNFTAvatar(twitterId: string) {
    return useAsync(async () => {
        const avatar = (await gun2.get(twitterId).then!()) as AvatarMetaData
        return avatar
    }, [twitterId]).value
}

export function saveNFTAvatar(avatarMeta: AvatarMetaData) {
    gun2
        //@ts-ignore
        .get(avatarMeta.twitterId)
        //@ts-ignore
        .put(avatarMeta).then!()
}
