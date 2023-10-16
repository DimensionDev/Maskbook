import { useCallback, useState } from 'react'
import { useMount } from 'react-use'
import { useMaskSharedTrans } from '../../../../utils/index.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import {
    toPNG,
    NFTAvatar,
    type NextIDAvatarMeta,
    type SelectTokenInfo,
    useSaveStringStorage,
} from '@masknet/plugin-avatar'
import { getAvatarId } from '../../utils/user.js'
import { InjectedDialog, SelectProviderModal } from '@masknet/shared'
import { Button, DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Instagram } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'

import { MaskMessages, NetworkPluginID } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    root: {},
    wallet: {
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

export function NFTAvatarSettingDialog() {
    const { t } = useMaskSharedTrans()
    const [open, setOpen] = useState(false)
    const { classes } = useStyles()
    const { account } = useChainContext()
    const identity = useCurrentVisitingIdentity()
    const saveNFTAvatar = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const onChange = useCallback(
        async (info: SelectTokenInfo) => {
            try {
                if (!info.token.metadata?.imageURL || !info.token.contract?.address) return
                if (!identity.identifier) return
                const image = await toPNG(info.token.metadata.imageURL)
                if (!image || !account) return
                const { profile_pic_url_hd } = await Instagram.uploadUserAvatar(image, identity.identifier.userId)
                const avatarId = getAvatarId(profile_pic_url_hd)
                const avatarInfo = await saveNFTAvatar(identity.identifier.userId, account, {
                    address: info.token.contract.address,
                    userId: identity.identifier.userId,
                    tokenId: info.token.tokenId,
                    avatarId,
                    chainId: (info.token.chainId ?? ChainId.Mainnet) as ChainId,
                    schema: (info.token.schema ?? SchemaType.ERC721) as SchemaType,
                    pluginId: info.pluginID,
                } as NextIDAvatarMeta)

                if (!avatarInfo) {
                    // eslint-disable-next-line no-alert
                    alert('Sorry, failed to save NFT Avatar. Please set again.')
                    setOpen(false)
                    return
                }

                // If the avatar is set successfully, reload the page
                window.location.reload()

                setOpen(false)
            } catch (error) {
                if (error instanceof Error) {
                    // eslint-disable-next-line no-alert
                    alert(error.message)
                    return
                }
            }
        },
        [identity, account, saveNFTAvatar],
    )

    const onClose = useCallback(() => setOpen(false), [])

    useMount(() => {
        return MaskMessages.events.nftAvatarSettingDialogUpdated.on((data) => setOpen(data.open))
    })

    const onClick = useCallback(() => {
        SelectProviderModal.open()
    }, [])
    return (
        <InjectedDialog keepMounted open={open} onClose={onClose} title={t('set_nft_profile_photo')}>
            <DialogContent style={{ padding: 16 }}>
                {account ? (
                    <NFTAvatar
                        onChange={onChange}
                        classes={{
                            root: classes.root,
                        }}
                    />
                ) : (
                    <div className={classes.wallet}>
                        <Button onClick={onClick}>{t('connect_your_wallet')}</Button>
                    </div>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
