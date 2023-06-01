import { memo, useEffect } from 'react'
import { useDashboardI18N } from '../../../locales/index.js'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { Words } from './Words.js'

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
}))

export const SignUpMnemonic = memo(function SignUpMnemonic() {
    const t = useDashboardI18N()

    const { classes } = useStyles()
    const { state } = useLocation() as {
        state: {
            personaName: string
        }
    }
    const [copyState, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const { words, refreshCallback } = useMnemonicWordsPuzzle()

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
    }, [copyState])

    return (
        <Box>
            <Box className={classes.header}>
                <Typography className={classes.second}>{t.persona_create_step({ step: '2' })}</Typography>
                <Button variant="text" className={classes.recovery}>
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
                <IconButton className={classes.iconButton}>
                    <Icons.Download2 size={18} />
                </IconButton>
                <IconButton className={classes.iconButton} onClick={() => copyToClipboard(words.join(' '))}>
                    <Icons.Copy size={18} />
                </IconButton>
            </Box>
            <SetupFrameController>
                <PrimaryButton width="125px" size="large" color="primary">
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </Box>
    )
})
