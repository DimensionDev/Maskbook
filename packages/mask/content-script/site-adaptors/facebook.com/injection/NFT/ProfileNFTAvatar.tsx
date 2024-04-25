import { useCallback, useEffect } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTAvatar, toPNG } from '@masknet/plugin-avatar'
import { hookInputUploadOnce } from '@masknet/injected-script'
import type { SelectTokenInfo } from '@masknet/plugin-avatar'
import { MaskMessages, NetworkPluginID } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import {
    searchFacebookAvatarListSelector,
    searchFacebookAvatarOpenFilesSelector,
    searchFacebookConfirmAvatarImageSelector,
    searchFacebookSaveAvatarButtonSelector,
} from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { getAvatarId } from '../../utils/user.js'

export async function injectProfileNFTAvatarInFacebook(signal: AbortSignal) {
    // The first step in setting an avatar
    const watcher = new MutationObserverWatcher(searchFacebookAvatarListSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <NFTAvatarInFacebookFirstStep />,
    )

    // The second step in setting an avatar
    const saveButtonWatcher = new MutationObserverWatcher(searchFacebookSaveAvatarButtonSelector()).useForeach(
        (node, key, proxy) => {
            const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
            root.render(<NFTAvatarInFacebookSecondStep />)
            return () => root.destroy()
        },
    )

    startWatch(saveButtonWatcher, signal)
}

const useStyles = makeStyles()({
    // eslint-disable-next-line tss-unused-classes/unused-classes
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
            if (!identity.identifier) return
            if (!info.token.metadata?.imageURL || !info.token.contract?.address) return

            const image = await toPNG(info.token.metadata.imageURL)
            if (!image) return

            await changeImageToActiveElements(image)

            MaskMessages.events.NFTAvatarUpdated.sendToLocal({
                userId: identity.identifier.userId,
                avatarId: '',
                address: info.token.contract.address,
                tokenId: info.token.tokenId,
                pluginID: info.pluginID ?? NetworkPluginID.PLUGIN_EVM,
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
