import { ImageEditorModal, UploadDropArea, useUnmountedRef } from '@masknet/shared'
import { Box, Button, DialogActions, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { MAX_FILE_SIZE } from '../../constants.js'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { t, Trans } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { FireflyConfig, FireflyRedPacket } from '@masknet/web3-providers'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useAsyncFn } from 'react-use'

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
    const { setCustomThemes, setTheme } = useRedPacket()

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
            snackbar.showSnackbar(t`Failed to create theme.`, {
                variant: 'error',
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
                        subtitle={
                            <>
                                <Typography className={classes.tips}>
                                    Supported formats: JPEG, PNG, GIF Size limit: 1MB
                                </Typography>
                                <Typography className={classes.tips}>Recommended dimensions: 1016 × 672 px</Typography>
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
                    :   <Trans>Save</Trans>}
                </Button>
            </DialogActions>
        </>
    )
}
