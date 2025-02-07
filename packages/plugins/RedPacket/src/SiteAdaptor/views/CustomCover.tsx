import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { formatFileSize, ImageEditorModal, UploadDropArea, useUnmountedRef } from '@masknet/shared'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { FireflyConfig, FireflyRedPacket } from '@masknet/web3-providers'
import { Box, Button, DialogActions, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { MAX_FILE_SIZE } from '../../constants.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useSolRedpacket } from '../contexts/SolRedpacketContext.js'
import { useEnvironmentContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
    },
    cover: {
        height: 317,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    coverImage: {
        objectFit: 'cover',
    },
    tips: {
        width: 270,
        fontFamily: 'Helvetica',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    actions: {
        display: 'flex',
        gap: theme.spacing(1),
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.maskColor.white,
    },
    dialogActions: {
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
}))

export function CustomCover() {
    const { classes } = useStyles()

    const navigate = useNavigate()
    const [blob, setBlob] = useState<Blob | File>()
    const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
    const { setCustomThemes: setEVMCustomThemes, setTheme: setEVMTheme } = useRedPacket()
    const { setCustomThemes: setSolCustomThemes, setTheme: setSolTheme } = useSolRedpacket()

    const { pluginID } = useEnvironmentContext()

    const setCustomThemes = pluginID === NetworkPluginID.PLUGIN_SOLANA ? setSolCustomThemes : setEVMCustomThemes
    const setTheme = pluginID === NetworkPluginID.PLUGIN_SOLANA ? setSolTheme : setEVMTheme

    useEffect(() => {
        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [url])

    const snackbar = useCustomSnackbar()
    const unmountedRef = useUnmountedRef()
    const [{ loading: saving }, save] = useAsyncFn(async () => {
        if (!blob) return
        const file = blob instanceof File ? blob : new File([blob], 'custom-cover.png')
        try {
            const url = await FireflyConfig.uploadToS3(file)
            const themeId = await FireflyRedPacket.createTheme({
                font_color: '#ffffff',
                image: url,
            })
            const theme = await FireflyRedPacket.getTheme({ themeId })
            if (unmountedRef.current) return
            if (theme) {
                setCustomThemes((themes) => [...themes, theme])
                setTheme(theme)
                navigate(-1)
            } else {
                throw new Error('No theme created')
            }
        } catch (err) {
            snackbar.showSnackbar(t`Failed to create theme.`, {
                variant: 'error',
                message: (err as Error).message,
            })
        }
    }, [blob])
    return (
        <>
            <Box className={classes.container}>
                {url ?
                    <Box className={classes.cover}>
                        <img className={classes.coverImage} src={url} width="100%" height="100%" />
                        <Box className={classes.actions}>
                            <Button
                                variant="roundedContained"
                                disableElevation
                                disableRipple
                                onClick={async () => {
                                    const blob = await ImageEditorModal.openAndWaitForClose({
                                        image: url,
                                        AvatarEditorProps: {
                                            border: [0, 30],
                                            borderRadius: 0,
                                            height: 317,
                                            width: 568,
                                            style: {
                                                borderRadius: 8,
                                            },
                                        },
                                    })
                                    if (blob) setBlob(blob)
                                }}>
                                <Icons.Edit2 size={16} />
                                <Trans>Edit</Trans>
                            </Button>
                            <Button
                                variant="roundedContained"
                                disableElevation
                                disableRipple
                                onClick={async () => {
                                    setBlob(undefined)
                                }}>
                                <Icons.Refresh size={16} />
                                <Trans>Reset</Trans>
                            </Button>
                        </Box>
                    </Box>
                :   <UploadDropArea
                        maxFileSize={MAX_FILE_SIZE}
                        onSelectFile={setBlob}
                        accept="image/png, image/jpeg"
                        subtitle={
                            <>
                                <Typography className={classes.tips}>
                                    <Trans>
                                        Supported formats: JPEG, PNG
                                        <br /> Size limit: {formatFileSize(MAX_FILE_SIZE)}
                                    </Trans>
                                </Typography>
                                <Typography className={classes.tips}>
                                    <Trans>Recommended dimensions: 1016 × 672 px</Trans>
                                </Typography>
                            </>
                        }
                    />
                }
            </Box>
            <DialogActions className={classes.dialogActions}>
                <Button className={classes.cancel} fullWidth variant="outlined" onClick={() => navigate(-1)}>
                    <Trans>Cancel</Trans>
                </Button>
                <Button variant="contained" disabled={!blob || saving} fullWidth onClick={save}>
                    {saving ?
                        <Trans>Saving</Trans>
                    :   <Trans>Confirm</Trans>}
                </Button>
            </DialogActions>
        </>
    )
}
