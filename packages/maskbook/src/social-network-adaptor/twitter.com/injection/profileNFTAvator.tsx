import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { ProfileIdentifier } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { NFTAvator } from '../../../components/InjectedComponents/NFTAvator'
import Services from '../../../extension/service'
import { gun2 } from '../../../network/gun/version.2'
import { activatedSocialNetworkUI } from '../../../social-network'
import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import {
    searchAvatorSelector,
    searchAvatorSelectorImage,
    searchAvatorSelectorInput,
    searchProfileSaveSelector,
} from '../utils/selector'
import { getTwitterId } from '../utils/user'

export function injectProfileNFTAvatorInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchAvatorSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatorInTwitter />)
}

export interface AvatorMetaData {
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

function NFTAvatorInTwitter() {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const useInfo = useGetCurrentUserInfo()
    const avator = useNFTAvator(twitterId)
    const profileSave = searchProfileSaveSelector().evaluate()
    const [avatorMeta, setAvatorMeta] = useState<AvatorMetaData>({} as AvatorMetaData)
    const onChange = useCallback(async (token: ERC721TokenDetailed, amount: string) => {
        UpdateAvator(token.info.image ?? '')
        const metaData = {
            twitterId,
            amount,
            tokenId: token.tokenId,
            address: token.contractDetailed.address,
            image: token.info.image ?? '',
        }
        setAvatorMeta(metaData)
    }, [])

    useEffect(() => {
        profileSave?.addEventListener('click', () => MaskMessage.events.NFTAvatorUpdated.sendToLocal(avatorMeta))
        return () =>
            profileSave?.removeEventListener('click', () => MaskMessage.events.NFTAvatorUpdated.sendToLocal(avatorMeta))
    }, [profileSave, avatorMeta])

    useEffect(() => {
        UpdateAvator(avator?.image ?? '')
    }, [avator])

    if (twitterId !== useInfo?.userId) return null
    return <NFTAvator onChange={onChange} classes={classes} />
}

async function UpdateAvator(image: string) {
    const blob = await Services.Helper.fetch(image)
    if (!blob) return
    const blobURL = URL.createObjectURL(blob)
    const avatorInput = searchAvatorSelectorInput().evaluate()[0]
    if (!avatorInput) return
    avatorInput.style.backgroundImage = `url("${blobURL.toString()}")`
    const avatorImage = searchAvatorSelectorImage().evaluate()[0]
    if (!avatorImage) return
    avatorImage.setAttribute('src', blobURL.toString())
}

export function useNFTAvator(twitterId: string) {
    return useAsync(async () => {
        const avator = (await gun2.get(twitterId).then!()) as AvatorMetaData
        return avator
    }, [twitterId]).value
}

export function saveNFTAvator(avatorMeta: AvatorMetaData) {
    gun2
        //@ts-ignore
        .get(avatorMeta.twitterId)
        //@ts-ignore
        .put(avatorMeta).then!()
}
