import { delay } from '@masknet/kit'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AvatarEditor from 'react-avatar-editor'
import { useSubscription } from 'use-subscription'
import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { usePersonaConnectStatus } from '@masknet/shared'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales/i18n_generated.js'
import { type AvatarInfo, useSave } from '../hooks/save/useSave.js'
import { useAvatarManagement } from '../contexts/index.js'
import { RoutePaths } from './Routes.js'

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

export function UploadAvatarDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const { proof, proofs, selectedTokenInfo } = useAvatarManagement()
    const { image, account, token, pluginID } = selectedTokenInfo ?? {}
    const isBindAccount = proofs.some((x) => isSameAddress(x.identity, selectedTokenInfo?.account))
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const { currentVisitingProfile } = useSNSAdaptorContext()
    const identifier = useSubscription(currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentPersona } = usePersonaConnectStatus()

    const [, saveAvatar] = useSave(currentPluginID)
    const navigate = useNavigate()

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

            navigate(RoutePaths.Exit)
            setDisabled(false)
            await delay(500)
            location.reload()
        }, 'image/png')
    }, [account, editor, identifier, navigate, currentPersona, proof, isBindAccount, saveAvatar])

    if (!account || !image || !token || !proof) return null

    return (
        <>
            <DialogContent className={classes.content}>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image}
                    style={{ width: 'auto', height: 400, borderRadius: 8 }}
                    scale={scale}
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
                <Button
                    disabled={disabled}
                    className={classes.cancel}
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(-1)}>
                    {t.cancel()}
                </Button>
                <Button fullWidth onClick={onSave} disabled={disabled}>
                    {t.save()}
                </Button>
            </DialogActions>
        </>
    )
}
