import { useCallback, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { useSubscription } from 'use-subscription'
import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus.js'
import type { BindingProof, NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../locales/i18n_generated.js'
import { context } from '../context.js'
import { useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { AvatarInfo, useSave } from '../hooks/save/useSave.js'
import type { AllChainsNonFungibleToken } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: 16,
        boxSizing: 'border-box',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    cancel: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111418',
        border: 'none',
        '&:hover': {
            border: 'none',
        },
    },
    content: {
        margin: 0,
        padding: 16,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        textAlign: 'center',
    },
}))

interface UploadAvatarDialogProps {
    account?: string
    isBindAccount?: boolean
    image?: string | File
    token?: AllChainsNonFungibleToken
    proof?: BindingProof
    pluginID?: NetworkPluginID
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
        const avatarId = Twitter.getAvatarId(data?.imageUrl ?? '')
        return { ...data, avatarId }
    } catch (err) {
        return
    }
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, account, token, onClose, onBack, proof, isBindAccount = false, pluginID } = props
    const t = useI18N()
    const { classes } = useStyles()
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const identifier = useSubscription(context.currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentPersona } = usePersonaConnectStatus()

    const [, saveAvatar] = useSave(currentPluginID)

    const onSave = useCallback(async () => {
        if (!editor || !account || !token || !currentPersona?.identifier || !proof) return
        editor.getImageScaledToCanvas().toBlob(async (blob) => {
            if (!blob) return
            setDisabled(true)
            const avatarData = await uploadAvatar(blob, proof.identity)
            if (!avatarData) {
                setDisabled(false)
                return
            }
            const response = await saveAvatar(
                account,
                isBindAccount,
                token,
                avatarData,
                currentPersona.identifier,
                proof,
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
    }, [account, editor, identifier, onClose, currentPersona, proof, isBindAccount, saveAvatar])

    if (!account || !image || !token || !proof) return null

    return (
        <Web3ContextProvider value={{ pluginID: currentPluginID, chainId: token.chainId }}>
            <DialogContent className={classes.content}>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image!}
                    style={{ width: 'auto', height: 400, borderRadius: 8 }}
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
                    sx={{
                        color: (theme) => theme.palette.maskColor.primary,
                        '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            backgroundColor: (theme) => theme.palette.maskColor.primary,
                        },
                        '& .MuiSlider-rail': {
                            opacity: 0.5,
                            backgroundColor: (theme) => theme.palette.maskColor.thirdMain,
                        },
                    }}
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
        </Web3ContextProvider>
    )
}
