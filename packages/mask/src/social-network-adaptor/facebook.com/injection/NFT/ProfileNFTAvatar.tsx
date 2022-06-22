import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
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
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../utils/user'
import { isMobileFacebook } from '../../utils/isMobile'
import { InMemoryStorages } from '../../../../../shared'
import type { SelectTokenInfo } from '../../../../plugins/Avatar/types'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export async function injectProfileNFTAvatarInFaceBook(signal: AbortSignal) {
    if (!isMobileFacebook) {
        // The first step in setting an avatar
        const watcher = new MutationObserverWatcher(searchFacebookAvatarListSelector())
        startWatch(watcher, signal)
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebookFirstStep />)

        // The second step in setting an avatar
        const saveButtonWatcher = new MutationObserverWatcher(searchFacebookSaveAvatarButtonSelector()).useForeach(
            (node, key, proxy) => {
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(<NFTAvatarInFacebookSecondStep />)
                return () => root.destroy()
            },
        )

        startWatch(saveButtonWatcher, signal)
    }
    const watcher = new MutationObserverWatcher(searchFacebookAvatarMobileListSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarListInFaceBookMobile />)
}

const useStyles = makeStyles()({
    root: {
        padding: '8px 0',
        margin: '0 16px',
    },
})

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    const imageBuffer = await image.arrayBuffer()
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer))
    searchFacebookAvatarOpenFilesSelector().evaluate()?.click()
}

function NFTAvatarInFacebookFirstStep() {
    const { classes } = useStyles()

    const identity = useCurrentVisitingIdentity()

    const onChange = useCallback(
        async (info: SelectTokenInfo) => {
            if (!info.token.metadata?.imageURL || !info.token.contract?.address) return
            const image = await toPNG(info.token.metadata.imageURL)
            if (!image) return
            if (!identity.identifier) return

            await changeImageToActiveElements(image)

            MaskMessages.events.NFTAvatarUpdated.sendToLocal({
                userId: identity.identifier.userId,
                avatarId: '',
                address: info.token.contract.address,
                tokenId: info.token.tokenId,
                pluginId: info.pluginId ?? NetworkPluginID.PLUGIN_EVM,
                chainId: info.token.chainId ?? ChainId.Mainnet,
                schema: info.token.schema ?? SchemaType.ERC721,
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
    const imageBuffer = await image.arrayBuffer()

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
        async (info: SelectTokenInfo) => {
            if (!info.token.metadata?.imageURL || !info.token.contract?.address) return
            const image = await toPNG(info.token.metadata.imageURL)
            if (!image) return

            await changeImageToActiveElementsOnMobile(image)

            identity.identifier &&
                InMemoryStorages.FacebookNFTEventOnMobile.storage.userId.setValue(identity.identifier.userId)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.address.setValue(info.token.contract?.address)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.tokenId.setValue(info.token.tokenId)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.pluginId.setValue(
                info.pluginId ?? NetworkPluginID.PLUGIN_EVM,
            )
            InMemoryStorages.FacebookNFTEventOnMobile.storage.chainId.setValue(info.token.chainId ?? ChainId.Mainnet)
            InMemoryStorages.FacebookNFTEventOnMobile.storage.schema.setValue(info.token.schema ?? SchemaType.ERC721)
        },
        [identity],
    )

    return <NFTAvatar onChange={onChange} classes={classes} />
}
