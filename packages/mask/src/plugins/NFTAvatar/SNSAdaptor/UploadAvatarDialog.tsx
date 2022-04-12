import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Twitter } from '@masknet/web3-providers'
import { getAvatarId } from '../../../social-network-adaptor/facebook.com/utils/user'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { RSS3_KEY_SNS } from '../../Avatar/constants'
import { MaskMessages } from '../../../utils'

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
        console.log(editor.getImage())
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            const data: Twitter.AvatarInfo = await Twitter.uploadUserAvatar('WeipingZhu2', blob)
            const avatarId = getAvatarId(data.imageURL)
            console.log('----------------------------------')
            console.log(data)

            const avatar = await PluginNFTAvatarRPC.saveNFTAvatar(
                account,
                {
                    userId: data.userId,
                    address: token.addrss,
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
            MaskMessages.events.requestComposition.sendToLocal({ reason: 'timeline', open: false })
        })
        onClose()
    }, [editor])
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
