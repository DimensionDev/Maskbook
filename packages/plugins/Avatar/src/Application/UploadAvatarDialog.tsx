import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { delay } from '@masknet/kit'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { currentVisitingProfile, share } from '@masknet/plugin-infra/content-script/context'
import { TransactionConfirmModal, usePersonaConnectStatus } from '@masknet/shared'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { Twitter } from '@masknet/web3-providers'
import { isSameAddress, TokenType } from '@masknet/web3-shared-base'
import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import { useCallback, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from 'use-subscription'
import { useAvatarManagement } from '../contexts/AvatarManagement.js'
import { type AvatarInfo, useSave } from '../hooks/useSave.js'
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
        '&:hover': {
            border: 'none',
            background: theme.palette.maskColor.bottom,
        },
    },
    content: {
        margin: 0,
        padding: 16,
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        textAlign: 'center',
    },
}))

async function uploadAvatar(blob: Blob, userId: string): Promise<AvatarInfo | undefined> {
    try {
        const media = await Twitter.uploadMedia(blob)
        const data = await Twitter.updateProfileImage(userId, media.media_id_string)
        if (!data) return
        return { ...data, avatarId: media.media_id_string }
    } catch (err) {
        return
    }
}

export function UploadAvatarDialog() {
    const { classes } = useStyles()
    const { proof, proofs, selectedTokenInfo } = useAvatarManagement()
    const { image, account, token, pluginID } = selectedTokenInfo ?? {}
    const isBindAccount = proofs.some((x) => isSameAddress(x.identity, selectedTokenInfo?.account))
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const identifier = useSubscription(currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentPersona } = usePersonaConnectStatus()
    const identity = useLastRecognizedIdentity()
    const saveAvatar = useSave(currentPluginID)
    const navigate = useNavigate()

    const onSave = useCallback(async () => {
        if (!editor || !account || !token || !currentPersona?.identifier) return
        editor.getImageScaledToCanvas().toBlob(async (blob) => {
            if (!blob || !identity?.identifier?.userId) return
            setDisabled(true)
            const avatarData = await uploadAvatar(blob, identity.identifier.userId)
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
                showSnackbar(<Trans>Sorry, failed to save NFT Avatar. Please set again.</Trans>, { variant: 'error' })
                setDisabled(false)
                return
            }

            showSnackbar(<Trans>Update NFT Avatar Success!</Trans>, { variant: 'success' })

            navigate(RoutePaths.Exit)
            setDisabled(false)
            await delay(500)
            TransactionConfirmModal.open({
                title: t`NFTs Profile`,
                message: t`You have set NFT PFP successfully.`,
                shareText: t`I just set my NFT PFP using Mask Extension for free! To browse other's unique NFT collections and web3 activities on Twitter. Download the most powerful tool Mask.io.`,
                tokenType: TokenType.Fungible,
                share,
            })
        }, 'image/png')
    }, [account, editor, identifier, navigate, currentPersona, proof, isBindAccount, saveAvatar, identity])

    if (!account || !image || !token) return null

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
                    <Trans>Cancel</Trans>
                </Button>
                <Button fullWidth onClick={onSave} disabled={disabled}>
                    <Trans>Save</Trans>
                </Button>
            </DialogActions>
        </>
    )
}
