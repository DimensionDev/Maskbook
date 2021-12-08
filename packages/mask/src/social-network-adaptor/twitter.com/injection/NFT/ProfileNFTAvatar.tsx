import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useState } from 'react'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { createReactRootShadowed, MaskMessages, NFTAvatarEvent, startWatch } from '../../../../utils'
import {
    searchAvatarOpenFileSelector,
    searchAvatarSelectorImage,
    searchProfessionalButtonSelector,
    searchProfileAvatarSelector,
    searchProfileSaveSelector,
} from '../../utils/selector'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../utils/user'
import { toPNG } from '../../../../plugins/Avatar/utils'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { hookInputUploadOnce } from '@masknet/injected-script'

export async function injectProfileNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles<{
    paddingTop: string
    paddingLeft: string
    paddingRight: string
    paddingBottom: string
}>()((theme, props) => ({
    root: {
        paddingLeft: props.paddingLeft,
        paddingTop: props.paddingTop,
        paddingRight: props.paddingRight,
        paddingBottom: props.paddingBottom,
    },
}))

function getStyles() {
    const ele = searchProfessionalButtonSelector().evaluate()

    if (!ele)
        return {
            paddingTop: '11px',
            paddingLeft: '14px',
            paddingRight: '14px',
            paddingBottom: '14px',
        }
    const style = window.getComputedStyle(ele)
    return {
        paddingTop: style.paddingTop,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        paddingBottom: style.paddingBottom,
    }
}

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    const imageBuffer = await blobToArrayBuffer(image)
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer))
    ;(searchAvatarOpenFileSelector().evaluate()[0]?.parentElement?.children[0] as HTMLElement)?.click()
}

function NFTAvatarInTwitter() {
    const { classes } = useStyles(getStyles())
    const identity = useCurrentVisitingIdentity()
    const [avatarEvent, setAvatarEvent] = useState<NFTAvatarEvent | undefined>()
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()

    useEffect(() => {
        if (!selectedToken) return
        const watcher = new MutationObserverWatcher(searchAvatarSelectorImage())
            .startWatch({
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src'],
            })
            .addListener('onChange', () => {
                assign(selectedToken)
            })

        return () => watcher.stopWatch()
    }, [selectedToken])

    const assign = async (token: ERC721TokenDetailed) => {
        const ele = searchAvatarSelectorImage().evaluate() as HTMLImageElement
        setAvatarEvent({
            userId: identity.identifier.userId,
            avatarId: getAvatarId(identity.avatar ?? ''),
            address: token.contractDetailed.address,
            tokenId: token.tokenId,
            imgUrl: ele.getAttribute('src') ?? '',
        })

        setSelectedToken(undefined)
    }
    const onChange = async (token: ERC721TokenDetailed) => {
        if (!token.info.image) return
        const image = await toPNG(token.info.image)
        if (!image) return
        changeImageToActiveElements(image)

        setSelectedToken(token)
    }

    const handler = () => {
        const ele = searchAvatarSelectorImage().evaluate() as HTMLImageElement
        const imgUrl = ele.getAttribute('src') ?? ''

        if (!imgUrl || !avatarEvent || !avatarEvent?.imgUrl || imgUrl !== avatarEvent?.imgUrl) {
            MaskMessages.events.NFTAvatarUpdated.sendToLocal({
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
            })
        } else {
            MaskMessages.events.NFTAvatarUpdated.sendToLocal(avatarEvent)
        }
        setAvatarEvent(undefined)
        setSelectedToken(undefined)
    }

    useEffect(() => {
        const profileSave = searchProfileSaveSelector().evaluate()
        if (!profileSave) return
        profileSave.addEventListener('click', handler)
        return () => profileSave.removeEventListener('click', handler)
    }, [handler])

    return <NFTAvatar onChange={onChange} classes={classes} />
}
