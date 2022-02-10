import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { hookInputUploadOnce } from '@masknet/injected-script'
import {
    searchFacebookAvatarListSelector,
    searchFacebookAvatarMobileListSelector,
    searchFacebookAvatarOpenFilesOnMobileSelector,
    searchFacebookAvatarOpenFilesSelector,
    searchFacebookConfirmAvatarImageSelector,
    searchFacebookSaveAvatarButtonSelector,
} from '../../utils/selector'
import { useCallback, useEffect } from 'react'
import { toPNG } from '../../../../plugins/Avatar/utils'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../utils/user'
import { isMobileFacebook } from '../../utils/isMobile'
import { InMemoryStorages } from '../../../../../shared'

export async function injectProfileNFTAvatarInFaceBook(signal: AbortSignal) {
    if (!isMobileFacebook) {
        // The first step in setting an avatar
        const watcher = new MutationObserverWatcher(searchFacebookAvatarListSelector())
        startWatch(watcher, signal)
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebookFirstStep />)

        // The second step in setting an avatar
        const saveButtonWatcher = new MutationObserverWatcher(searchFacebookSaveAvatarButtonSelector())
        startWatch(saveButtonWatcher, signal)
        createReactRootShadowed(saveButtonWatcher.firstDOMProxy.afterShadow, { signal }).render(
            <NFTAvatarInFacebookSecondStep />,
        )
    }
    const watcher = new MutationObserverWatcher(searchFacebookAvatarMobileListSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarListInFaceBookMobile />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: '8px 0',
        margin: '0 16px',
    },
}))

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    const imageBuffer = await blobToArrayBuffer(image)
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer))
    searchFacebookAvatarOpenFilesSelector().evaluate()?.click()
}

function NFTAvatarInFacebookFirstStep() {
    const { classes } = useStyles()

    const identity = useCurrentVisitingIdentity()

    const onChange = useCallback(
        async (token: ERC721TokenDetailed) => {
            if (!token.info.imageURL) return
            const image = await toPNG(token.info.imageURL)
            if (!image) return

            await changeImageToActiveElements(image)

            MaskMessages.events.NFTAvatarUpdated.sendToLocal({
                userId: identity.identifier.userId,
                avatarId: '',
                address: token.contractDetailed.address,
                tokenId: token.tokenId,
            })
        },
        [identity],
    )

    return <NFTAvatar onChange={onChange} classes={classes} />
}

function NFTAvatarInFacebookSecondStep() {
    useEffect(() => {
        const save = searchFacebookSaveAvatarButtonSelector().evaluate().at(0)
        if (!save) return
        const handler = () => {
            const image = searchFacebookConfirmAvatarImageSelector().evaluate()
            if (!image) return

            const imageURL = image.getAttribute('src')
            if (!imageURL) return

            const avatarId = getAvatarId(imageURL)
            if (avatarId) {
                MaskMessages.events.NFTAvatarUpdated.sendToLocal({
                    userId: '',
                    address: '',
                    tokenId: '',
                    avatarId,
                })
            }
        }

        save.addEventListener('click', handler)

        return () => save.removeEventListener('click', handler)
    }, [])
    return null
}

async function changeImageToActiveElementsOnMobile(image: File | Blob): Promise<void> {
    const imageBuffer = await blobToArrayBuffer(image)

    const input = searchFacebookAvatarOpenFilesOnMobileSelector().evaluate()

    if (input) {
        input.style.visibility = 'unset'
        input.focus()
        hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer), true)
        input.style.visibility = 'hidden'

        const file = new File([image], 'avatar.png', { type: 'image/png', lastModified: Date.now() })
        const container = new DataTransfer()
        container.items.add(file)
        input.files = container.files
    }
}

const useMobileStyles = makeStyles()({
    root: {
        backgroundColor: '#ffffff',
    },
})

function NFTAvatarListInFaceBookMobile() {
    const { classes } = useMobileStyles()
    const identity = useCurrentVisitingIdentity()

    const onChange = useCallback(
        async (token: ERC721TokenDetailed) => {
            if (!token.info.imageURL) return
            const image = await toPNG(token.info.imageURL)
            if (!image) return

            await changeImageToActiveElementsOnMobile(image)

            InMemoryStorages.FacebookNFTEventOnMobile.storage.userId.setValue(identity.identifier.userId)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.address.setValue(token.contractDetailed.address)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.tokenId.setValue(token.tokenId)
        },
        [identity],
    )

    return <NFTAvatar onChange={onChange} classes={classes} />
}
