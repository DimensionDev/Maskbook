import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Twitter } from '@masknet/web3-providers'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { RSS3_KEY_SNS } from '../../Avatar/constants'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { CrossIsolationMessages } from '@masknet/shared-base'

const useStyles = makeStyles()(() => ({
    root: {},
}))

interface UploadAvatarDialogProps {
    account: string
    open: boolean
    onClose: () => void
    image: string | File
    token: ERC721TokenDetailed
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, open, onClose, account, token } = props
    const { classes } = useStyles()
    const identity = useCurrentVisitingIdentity()
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const onSave = useCallback(() => {
        if (!editor) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            const data = await Twitter.uploadUserAvatar(identity.identifier.userId, blob)
            const avatarId = getAvatarId(data?.imageUrl ?? '')

            const avatar = await PluginNFTAvatarRPC.saveNFTAvatar(
                account,
                {
                    userId: data?.userId ?? '',
                    address: token.contractDetailed.address,
                    tokenId: token.tokenId,
                    avatarId,
                },
                identity.identifier.network,
                RSS3_KEY_SNS.TWITTER,
            ).catch((error) => {
                window.alert(error.message)
                return
            })
            if (!avatar) {
                window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                return
            }
            CrossIsolationMessages.events.requestComposition.sendToLocal({ open: false, reason: 'timeline' })
        })
        onClose()
    }, [editor, identity])
    return (
        <InjectedDialog open={open} title="Edit Profile" onClose={onClose}>
            <DialogContent>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image!}
                    border={50}
                    style={{ width: '100%', height: '100%' }}
                    scale={scale ?? 1}
                    rotate={0}
                    borderRadius={300}
                />
                <Slider
                    max={2}
                    min={0.5}
                    step={0.1}
                    defaultValue={1}
                    onChange={(_, value) => setScale(value as number)}
                    aria-label="Scale"
                />
            </DialogContent>
            <DialogActions>
                <Button sx={{ flex: 1 }} variant="text" onClick={onClose}>
                    Cancel
                </Button>
                <Button sx={{ flex: 1 }} variant="contained" onClick={onSave}>
                    Save
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
