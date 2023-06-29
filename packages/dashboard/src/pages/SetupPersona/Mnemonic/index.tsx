import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useDashboardI18N } from '../../../locales/index.js'
import { MaskColorVar, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Box, Button, Checkbox, FormControlLabel, IconButton, Stack, Typography, alpha } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard, useAsync, useAsyncFn } from 'react-use'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { Words } from './Words.js'
import { ComponentToPrint } from './ComponentToPrint.js'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import { toBlob } from 'html-to-image'
import { Services } from '../../../API.js'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext.js'
import { DashboardRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    recovery: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },

    refresh: {
        color: theme.palette.maskColor.main,
        columnGap: 4,
        fontWeight: 700,
        fontSize: 12,
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
        marginTop: 12,
    },
    iconButton: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        color: theme.palette.maskColor.main,
    },
    warning: {
        background: alpha(theme.palette.maskColor.warn, 0.1),
        borderRadius: 4,
        backdropFilter: 'blur(5px)',
        marginTop: theme.spacing(1.5),
        padding: theme.spacing(1.5),
        display: 'flex',
        columnGap: 6,
        alignItems: 'center',
    },
    warningText: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.warn,
    },
    label: {
        fontSize: 14,
    },
}))

export const SignUpMnemonic = memo(function SignUpMnemonic() {
    const ref = useRef(null)

    const navigate = useNavigate()
    const t = useDashboardI18N()
    const createPersona = useCreatePersonaV2()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const { classes } = useStyles()
    const { state } = useLocation() as {
        state: {
            personaName: string
        }
    }

    const [checked, setChecked] = useState(true)

    const [copyState, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const { words, refreshCallback } = useMnemonicWordsPuzzle()

    const [, handleDownload] = useAsyncFn(async () => {
        if (!ref.current) return
        const dataUrl = await toBlob(ref.current, { quality: 0.95 })
        if (!dataUrl) return

        const link = document.createElement('a')
        link.download = `mask-persona-${state.personaName}.jpeg`
        link.href = URL.createObjectURL(dataUrl)
        link.click()
    }, [])

    const [{ loading }, handleCreate] = useAsyncFn(async () => {
        try {
            const identifier = await createPersona(words.join(' '), state.personaName)
            await changeCurrentPersona(identifier)
            navigate(DashboardRoutes.SignUpPersonaOnboarding)
        } catch (error) {
            showSnackbar((error as Error).message, { variant: 'error' })
        }
    }, [words])

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.RecoveryPersona)
    }, [])

    const { value } = useAsync(async () => {
        if (!words.length) return

        const { privateKey, publicKey } = await Services.Identity.queryPersonaKeyByMnemonicV2(words.join(' '))

        return {
            privateKey,
            publicKey: publicKey.replace('ec_key:secp256k1/', ''),
        }
    }, [state.personaName, words.join('')])

    useEffect(() => {
        if (copyState.value) {
            showSnackbar(t.personas_export_persona_copy_success(), {
                variant: 'success',
                message: t.persona_phrase_copy_description(),
            })
        }
        if (copyState.error?.message) {
            showSnackbar(t.personas_export_persona_copy_failed(), { variant: 'error' })
        }
    }, [copyState.value, copyState.error?.message])

    return (
        <Box>
            <Box className={classes.header}>
                <Typography className={classes.second}>{t.persona_create_step({ step: '2' })}</Typography>
                <Button variant="text" className={classes.recovery} onClick={handleRecovery}>
                    {t.recovery()}
                </Button>
            </Box>
            <Typography variant="h1" className={classes.title}>
                {t.persona_phrase_title()}
            </Typography>
            <Typography className={classes.second} mt={2}>
                {t.persona_phrase_tips()}
            </Typography>

            <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                <Button className={classes.refresh} variant="text" onClick={refreshCallback}>
                    <Icons.Refresh size={16} />
                    {t.refresh()}
                </Button>
            </Stack>
            <Words words={words} />
            <Box className={classes.buttonGroup}>
                <IconButton className={classes.iconButton} onClick={handleDownload}>
                    <Icons.Download2 size={18} />
                </IconButton>
                <IconButton className={classes.iconButton} onClick={() => copyToClipboard(words.join(' '))}>
                    <Icons.Copy size={18} />
                </IconButton>
            </Box>
            <Box className={classes.warning}>
                <Icons.WarningTriangle size={20} />
                <Typography className={classes.warningText}>{t.persona_phrase_create_tips()}</Typography>
            </Box>

            <FormControlLabel
                classes={{ label: classes.label }}
                control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
                label={t.persona_phrase_create_check_tips()}
                sx={{ marginTop: '12px', color: MaskColorVar.textSecondary }}
            />

            <Box sx={{ position: 'absolute', top: -9999 }}>
                <ComponentToPrint
                    ref={ref}
                    words={words}
                    privateKey={value?.privateKey ?? ''}
                    publicKey={value?.publicKey ?? ''}
                    personaName={state.personaName}
                />
            </Box>

            <SetupFrameController>
                <PrimaryButton width="125px" size="large" color="primary" loading={loading} onClick={handleCreate}>
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </Box>
    )
})
