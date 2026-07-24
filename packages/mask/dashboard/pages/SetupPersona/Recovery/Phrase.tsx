import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { delay } from '@masknet/kit'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { some } from 'lodash-es'
import { memo, useCallback, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useList } from 'react-use'
import { DesktopMnemonicConfirm } from '../../../components/Mnemonic/index.js'
import { OutletPortal } from '../../../components/OutletPortal.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SignUpRoutePath } from '../../SignUp/routePath.js'

const useStyles = makeStyles()((theme) => ({
    error: {
        marginTop: theme.spacing(2),
        color: theme.vars.palette.maskColor.danger,
    },
}))

export const Component = memo(function Phrase() {
    const { classes } = useStyles()
    const [error, setError] = useState<ReactNode>()

    const [values, { updateAt, set: setMnemonic }] = useList(() => Array.from({ length: 12 }, () => ''))
    const handleWordChange = useCallback((word: string, index: number) => {
        updateAt(index, word)
        setError?.(undefined)
    }, [])

    const disabled = some(values, (value) => !value)
    const navigate = useNavigate()

    const handleRestoreFromMnemonic = useCallback(
        async (values: string[]) => {
            try {
                const persona = await Services.Identity.queryPersonaByMnemonic(values.join(' '), '')
                if (persona) {
                    await Services.Settings.setCurrentPersonaIdentifier(persona)
                    // Waiting persona changed event notify
                    await delay(100)
                    navigate(DashboardRoutes.SignUpPersonaOnboarding, { replace: true })
                } else {
                    navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.PersonaRecovery}`, {
                        replace: false,
                        state: { mnemonic: values },
                    })
                }
            } catch {
                setError(<Trans>Incorrect recovery phrase.</Trans>)
            }
        },
        [navigate],
    )
    const handleImport = useCallback(async () => handleRestoreFromMnemonic(values), [values, handleRestoreFromMnemonic])
    return (
        <Box>
            <DesktopMnemonicConfirm onChange={handleWordChange} puzzleWords={values} setAll={setMnemonic} />
            {error ?
                <Typography className={classes.error} variant="body2">
                    {error}
                </Typography>
            :   null}

            <OutletPortal>
                <PrimaryButton size="large" color="primary" disabled={disabled} onClick={handleImport}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </OutletPortal>
        </Box>
    )
})
