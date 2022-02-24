import { searchInstagramAvatarOpenFilesSelector } from '../../utils/selector'
import { MaskMessages, useI18N } from '../../../../utils'
import { useCallback, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { toPNG } from '../../../../plugins/Avatar/utils'
import { InMemoryStorages } from '../../../../../shared'
import { useMount } from 'react-use'
import { clearStorages } from '../../utils/user'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { DialogContent } from '@mui/material'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { DialogStackingProvider, makeStyles } from '@masknet/theme'
import { hookInputUploadOnce } from '@masknet/injected-script'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    root: {
        padding: '8px 0',
        margin: '0 16px',
    },
}))

async function changeImageToActiveElements(image: File | Blob): Promise<void> {
    const imageBuffer = await image.arrayBuffer()
    hookInputUploadOnce('image/png', 'avatar.png', new Uint8Array(imageBuffer))
    searchInstagramAvatarOpenFilesSelector().evaluate()?.click()
}

export function NFTAvatarSettingDialog() {
    const { t } = useI18N()
    const [open, setOpen] = useState(false)
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
            setOpen(false)
        },
        [identity],
    )

    const onClose = useCallback(() => setOpen(false), [])

    useMount(() => {
        clearStorages()
        return MaskMessages.events.nftAvatarSettingDialogUpdated.on((data) => setOpen(data.open))
    })

    return (
        <DialogStackingProvider>
            <InjectedDialog keepMounted open={open} onClose={onClose} title={t('set_nft_profile_photo')}>
                <DialogContent>
                    <NFTAvatar onChange={onChange} classes={classes} hideWallet />
                </DialogContent>
            </InjectedDialog>
        </DialogStackingProvider>
    )
}
