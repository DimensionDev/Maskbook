import { MaskMessages, useI18N } from '../../../../utils'
import { useCallback, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { toPNG } from '../../../../plugins/Avatar/utils'
import { useMount } from 'react-use'
import { getAvatarId } from '../../utils/user'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { DialogStackingProvider, makeStyles } from '@masknet/theme'
import { Instagram } from '@masknet/web3-providers'
import { useWallet } from '@masknet/plugin-infra/web3'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { delay } from '@dimensiondev/kit'
import type { NonFungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    root: {
        padding: '8px 0',
        margin: '0 16px',
    },
}))

export function NFTAvatarSettingDialog() {
    const { t } = useI18N()
    const [open, setOpen] = useState(false)
    const { classes } = useStyles()
    const wallet = useWallet()
    const identity = useCurrentVisitingIdentity()

    const onChange = useCallback(
        async (token: NonFungibleToken<ChainId, SchemaType>) => {
            try {
                if (!token.metadata?.imageURL || !token.contract?.address) return
                if (!identity.identifier) return
                const image = await toPNG(token.metadata.imageURL)
                if (!image || !wallet) return

                await Instagram.uploadUserAvatar(image, identity.identifier.userId)

                await delay(1000)

                const url = `${location.protocol}//${location.host}/${identity.identifier.userId}`

                const response = await fetch(url)
                const htmlString = await response.text()

                const html = document.createElement('html')
                html.innerHTML = htmlString

                const metaTag = html.querySelector<HTMLMetaElement>('meta[property="og:image"]')

                if (!metaTag?.content) return

                const avatarInfo = await PluginNFTAvatarRPC.saveNFTAvatar(
                    wallet.address,
                    {
                        userId: identity.identifier.userId,
                        tokenId: token.tokenId,
                        address: token.contract.address,
                        avatarId: getAvatarId(metaTag.content),
                    } as AvatarMetaDB,
                    identity.identifier.network,
                    RSS3_KEY_SNS.INSTAGRAM,
                )

                if (!avatarInfo) {
                    window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                    setOpen(false)
                    return
                }

                await PluginNFTAvatarRPC.clearCache(
                    identity.identifier.userId,
                    activatedSocialNetworkUI.networkIdentifier,
                    RSS3_KEY_SNS.INSTAGRAM,
                )

                // If the avatar is set successfully, reload the page
                window.location.reload()

                setOpen(false)
            } catch (error) {
                if (error instanceof Error) {
                    window.alert(error.message)
                    return
                }
            }
        },
        [identity, wallet],
    )

    const onClose = useCallback(() => setOpen(false), [])

    useMount(() => {
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
