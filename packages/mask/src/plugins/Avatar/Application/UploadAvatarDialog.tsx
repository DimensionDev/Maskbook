import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { Twitter } from '@masknet/web3-providers'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import type { BindingProof } from '@masknet/shared-base'
import { useI18N } from '../locales/i18n_generated'
import { context } from '../context'
import { useSubscription } from 'use-subscription'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { AvatarInfo, useSave } from '../hooks/save/useSave'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
    cancel: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111418',
        border: 'none',
        '&:hover': {
            border: 'none',
        },
    },
}))

interface UploadAvatarDialogProps {
    account?: string
    isBindAccount?: boolean
    image?: string | File
    token?: NonFungibleToken<ChainId, SchemaType>
    proof?: BindingProof
    pluginId?: NetworkPluginID
    onBack: () => void
    onClose: () => void
}

async function uploadAvatar(blob: Blob, userId: string): Promise<AvatarInfo | undefined> {
    try {
        const media = await Twitter.uploadUserAvatar(userId, blob)
        const data = await Twitter.updateProfileImage(userId, media.media_id_string)
        if (!data) {
            return
        }
        const avatarId = getAvatarId(data?.imageUrl ?? '')
        return { ...data, avatarId }
    } catch (err) {
        return
    }
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, account, token, onClose, onBack, proof, isBindAccount = false, pluginId } = props
    const currentPluginId = useCurrentWeb3NetworkPluginID(pluginId)
    const { classes } = useStyles()
    const identifier = useSubscription(context.currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const t = useI18N()
    const [, saveAvatar] = useSave()

    const onSave = useCallback(() => {
        if (!editor) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob || !account || !token || !currentConnectedPersona?.linkedProfiles[0].identifier || !proof) return
            setDisabled(true)

            const avatarData = await uploadAvatar(blob, currentConnectedPersona?.linkedProfiles[0].identifier.userId)
            if (!avatarData) {
                setDisabled(false)
                return
            }

            const response = await saveAvatar(
                currentPluginId,
                account,
                isBindAccount,
                token,
                avatarData,
                currentConnectedPersona.identifier,
                proof,
                currentConnectedPersona.linkedProfiles[0].identifier,
            )

            if (!response) {
                showSnackbar(t.upload_avatar_failed_message(), { variant: 'error' })
                setDisabled(false)
                return
            }
            showSnackbar(t.upload_avatar_success_message(), { variant: 'success' })
            location.reload()
            onClose()
            setDisabled(false)
        })
    }, [account, editor, identifier, onClose, currentConnectedPersona, proof, isBindAccount, saveAvatar])

    if (!account || !image || !token || !proof) return null

    return (
        <>
            <DialogContent sx={{ overFlow: 'hidden' }}>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image!}
                    style={{ width: '100%', height: '100%' }}
                    scale={scale ?? 1}
                    rotate={0}
                    border={50}
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
            <DialogActions className={classes.actions}>
                <Button className={classes.cancel} fullWidth variant="outlined" onClick={onBack}>
                    {t.cancel()}
                </Button>
                <Button disabled={disabled} fullWidth variant="contained" onClick={onSave}>
                    {t.save()}
                </Button>
            </DialogActions>
        </>
    )
}
