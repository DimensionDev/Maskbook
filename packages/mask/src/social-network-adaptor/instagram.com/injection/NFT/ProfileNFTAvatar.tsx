import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarListSelector, searchInstagramAvatarOpenFilesSelector } from '../../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useCallback } from 'react'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { makeStyles } from '@masknet/theme'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { hookInputUploadOnce } from '@masknet/injected-script'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { toPNG } from '../../../../plugins/Avatar/utils'
import { InMemoryStorages } from '../../../../../shared'
import { useMount } from 'react-use'
import { clearStorages } from '../../utils/user'

export async function injectProfileNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarListSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInInstagramFirstStep />)
}

const useStyles = makeStyles()(() => ({
    root: {
        padding: '8px 0',
        margin: '0 16px',
    },
}))

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    const imageBuffer = await blobToArrayBuffer(image)
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer))
    searchInstagramAvatarOpenFilesSelector().evaluate()?.click()
}

function NFTAvatarInInstagramFirstStep() {
    const { classes } = useStyles()
    const identity = useCurrentVisitingIdentity()

    const onChange = useCallback(
        async (token: ERC721TokenDetailed) => {
            if (!token.info.imageURL) return
            const image = await toPNG(token.info.imageURL)
            if (!image) return
            await changeImageToActiveElements(image)

            InMemoryStorages.InstagramNFTEvent?.storage.userId.setValue(identity.identifier.userId)
            InMemoryStorages.InstagramNFTEvent?.storage.address.setValue(token.contractDetailed.address)
            InMemoryStorages.InstagramNFTEvent?.storage.tokenId.setValue(token.tokenId)
        },
        [identity],
    )

    useMount(clearStorages)

    return <NFTAvatar onChange={onChange} classes={classes} />
}
