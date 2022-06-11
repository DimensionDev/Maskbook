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
import { useCurrentWeb3NetworkPluginID, useWallet } from '@masknet/plugin-infra/web3'
import type { SelectTokenInfo } from '../../../../plugins/Avatar/types'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { delay } from '@dimensiondev/kit'
import { useSaveNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import type { EnhanceableSite } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

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
    const pluginId = useCurrentWeb3NetworkPluginID()
    const [, saveNFTAvatar] = useSaveNFTAvatar()

    const onChange = useCallback(
        async (info: SelectTokenInfo) => {
            try {
                if (!info.token.metadata?.imageURL || !info.token.contract?.address) return
                if (!identity.identifier) return
                const image = await toPNG(info.token.metadata.imageURL)
                if (!image || !wallet) return

                await Instagram.uploadUserAvatar(image, identity.identifier.userId)

                await delay(1000)

                const url = `${location.protocol}//${location.host}/${identity.identifier.userId}`

                const response = await fetch(url)
                const htmlString = await response.text()

                const html = document.createElement('html')
                html.innerHTML = htmlString

                const imgTag = html.querySelector<HTMLImageElement>('button > img')
                if (!imgTag?.src) return

                const avatarInfo = await saveNFTAvatar(
                    wallet.address,
                    {
                        userId: identity.identifier.userId,
                        tokenId: info.token.tokenId,
                        address: info.token.address,
                        avatarId: getAvatarId(imgTag.src),
                        chainId: (info.token.chainId ?? ChainId.Mainnet) as ChainId,
                        schema: (info.token.schema ?? SchemaType.ERC721) as SchemaType,
                        pluginId: info.pluginId,
                    },
                    identity.identifier.network as EnhanceableSite,
                    RSS3_KEY_SNS.INSTAGRAM,
                    pluginId,
                )

                if (!avatarInfo) {
                    window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                    setOpen(false)
                    return
                }

                await PluginNFTAvatarRPC.clearCache(
                    identity.identifier.userId,
                    activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
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
        [identity, wallet, saveNFTAvatar],
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
