import { memo, useCallback, useRef, useState } from 'react'
import { useAsyncFn, useDropArea } from 'react-use'
import { useNavigate } from 'react-router-dom'
import AvatarEditor from 'react-avatar-editor'
import { Box, Button, Slider, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, useSnackbar } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { BottomController } from '../../../components/BottomController/index.js'
import { NormalHeader } from '../../../components/index.js'
import { PopupRoutes } from '@masknet/shared-base'
import { useTitle } from '../../../hooks/index.js'
import Services from '#services'
import { MAX_FILE_SIZE } from '../../../constants.js'
import { useQueryClient } from '@tanstack/react-query'
import { Trans, useLingui } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    uploadBox: {
        background: theme.vars.palette.maskColor.whiteBlue,
        padding: theme.spacing(3),
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 10,
    },
    uploadIcon: {
        width: 54,
        height: 54,
        borderRadius: '50%',
        background: theme.vars.palette.maskColor.secondaryBottom,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 6px 0px rgba(102, 108, 135, 0.10)',
        ...theme.applyStyles('dark', {
            boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
        }),
    },
    typo: {
        color: theme.vars.palette.maskColor.third,
        textAlign: 'center',
        lineHeight: '18px',
    },
    strong: {
        color: theme.vars.palette.maskColor.second,
        textAlign: 'center',
        lineHeight: '18px',
    },
    file: {
        display: 'none',
    },
}))

const PersonaAvatarSetting = memo(function PersonaAvatar() {
    const { t } = useLingui()
    const editorRef = useRef<AvatarEditor | null>(null)
    const navigate = useNavigate()
    const { classes } = useStyles()
    const queryClient = useQueryClient()
    const [avatarLoaded, setAvatarLoaded] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const { currentPersona, refreshAvatar } = PersonaContext.useContainer()

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | string | null>()

    const [scale, setScale] = useState(1)

    const handleSetFile = useCallback((file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            enqueueSnackbar(<Trans>Failed to set Avatar.</Trans>, { variant: 'error' })
            return
        }
        setAvatarLoaded(false)
        setFile(file)
    }, [])

    const [bound] = useDropArea({
        onFiles(files) {
            handleSetFile(files[0])
        },
    })

    const [{ loading: uploadLoading }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (!editorRef.current || !file || !currentPersona?.identifier) return

            await new Promise<void>((resolve, reject) => {
                editorRef.current?.getImage().toBlob(async (blob) => {
                    if (blob) {
                        const identifier = await Services.Settings.getCurrentPersonaIdentifier()
                        await Services.Identity.updatePersonaAvatar(identifier, blob)
                        resolve()
                    }
                    reject()
                })
            })

            queryClient.removeQueries({
                queryKey: ['@@persona', 'avatar', currentPersona?.identifier.rawPublicKey],
            })
            refreshAvatar()

            enqueueSnackbar(<Trans>Avatar set successfully</Trans>, { variant: 'success' })
            navigate(PopupRoutes.Personas, { replace: true })
        } catch {
            enqueueSnackbar(<Trans>Failed to set Avatar.</Trans>, { variant: 'error' })
        }
    }, [file, currentPersona, refreshAvatar, queryClient])

    useTitle(t`Profile Photo`)

    if (file) {
        return (
            <Box>
                <NormalHeader />
                <Box sx={{ p: 2 }}>
                    <AvatarEditor
                        ref={editorRef}
                        image={file}
                        border={50}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        scale={scale ?? 1}
                        rotate={0}
                        borderRadius={300}
                        crossOrigin="anonymous"
                        onLoadSuccess={() => setAvatarLoaded(true)}
                    />
                    <Slider
                        max={2}
                        min={0.5}
                        step={0.1}
                        defaultValue={1}
                        onChange={(_, value) => setScale(value as number)}
                        aria-label="Scale"
                    />
                </Box>
                <BottomController>
                    <Button variant="outlined" onClick={() => setFile(null)} fullWidth>
                        <Trans>Cancel</Trans>
                    </Button>
                    <ActionButton fullWidth onClick={handleConfirm} loading={uploadLoading} disabled={!avatarLoaded}>
                        <Trans>Confirm</Trans>
                    </ActionButton>
                </BottomController>
            </Box>
        )
    }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }} data-hide-scrollbar>
            <NormalHeader />
            <Box sx={{ p: 2 }}>
                <Box className={classes.uploadBox} {...bound}>
                    <input
                        className={classes.file}
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={inputRef}
                        onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                            if (!currentTarget.files) return
                            handleSetFile(currentTarget.files[0])
                        }}
                    />
                    <Box className={classes.uploadIcon}>
                        <Icons.Upload size={30} />
                    </Box>
                    <Typography className={classes.typo}>
                        <strong>
                            <Trans>Drag & Drop your file here</Trans>
                        </strong>
                        <br />
                        <Trans>Size limit: 10 MB</Trans>
                    </Typography>
                    <Typography component="strong" className={classes.strong}>
                        <Trans>Or</Trans>
                    </Typography>
                    <Button style={{ width: 164 }} color="info" onClick={() => inputRef.current?.click()}>
                        <Trans>Browser File</Trans>
                    </Button>
                </Box>
            </Box>
        </Box>
    )
})

export { PersonaAvatarPage as Component }
function PersonaAvatarPage() {
    return <PersonaAvatarSetting />
}
