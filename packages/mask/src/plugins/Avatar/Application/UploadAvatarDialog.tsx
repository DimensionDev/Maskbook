import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { Twitter } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import type { BindingProof } from '@masknet/shared-base'
import { useI18N } from '../locales/i18n_generated'
import { context } from '../context'
import { useSubscription } from 'use-subscription'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { AvatarInfo, useSave } from '../hooks/save/useSave'
import { SelectTokenInfo, SET_NFT_FLAG } from '../types'

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
    isBindAccount?: boolean
    proof?: BindingProof
    tokenInfo?: SelectTokenInfo
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

async function uploadBackgroundImage(blob: Blob, userId: string): Promise<AvatarInfo | undefined> {
    // test
    return {} as AvatarInfo
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { onClose, onBack, proof, isBindAccount = false, tokenInfo } = props
    const currentPluginId = useCurrentWeb3NetworkPluginID(tokenInfo?.pluginId)
    const { classes } = useStyles()
    const identifier = useSubscription(context.currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const t = useI18N()

    const [, saveAvatar] = useSave(currentPluginId, (tokenInfo?.token?.chainId ?? ChainId.Mainnet) as ChainId)

    const onSave = useCallback(async () => {
        if (!editor || !tokenInfo?.account || !tokenInfo?.token || !currentConnectedPersona?.identifier || !proof)
            return
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            setDisabled(true)

            let avatarData: AvatarInfo | undefined
            if (tokenInfo.flag === SET_NFT_FLAG.NFT_PFP) {
                avatarData = await uploadAvatar(blob, proof.identity)
                if (!avatarData) {
                    setDisabled(false)
                    return
                }
            } else {
                avatarData = await uploadBackgroundImage(blob, proof.identity)
                if (!avatarData) {
                    setDisabled(false)
                    return
                }
            }
            const response = await saveAvatar(
                tokenInfo.account,
                isBindAccount,
                tokenInfo.token,
                avatarData,
                currentConnectedPersona.identifier,
                proof,
                tokenInfo.flag,
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
        }, 'image/png')
    }, [tokenInfo, editor, identifier, onClose, currentConnectedPersona, proof, isBindAccount, saveAvatar])

    if (!tokenInfo?.account || !tokenInfo?.image || !tokenInfo?.token || !proof) return null

    return (
        <>
            <DialogContent sx={{ overFlow: 'hidden' }}>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={tokenInfo.image}
                    style={{ width: '100%', height: '100%' }}
                    scale={scale ?? 1}
                    rotate={0}
                    border={50}
                    borderRadius={300}
                />
                <Slider
                    disabled={disabled}
                    max={2}
                    min={0.5}
                    step={0.1}
                    defaultValue={1}
                    onChange={(_, value) => setScale(value as number)}
                    aria-label="Scale"
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button disabled={disabled} className={classes.cancel} fullWidth variant="outlined" onClick={onBack}>
                    {t.cancel()}
                </Button>
                <Button fullWidth onClick={onSave} disabled={disabled}>
                    {t.save()}
                </Button>
            </DialogActions>
        </>
    )
}
