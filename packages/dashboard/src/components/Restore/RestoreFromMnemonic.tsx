import { delay } from '@masknet/kit'
import { DashboardRoutes } from '@masknet/shared-base'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { some } from 'lodash-es'
import { useCallback, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useList } from 'react-use'
import { Services } from '../../API.js'
import { usePersonaRecovery } from '../../contexts/index.js'
import { useDashboardI18N } from '../../locales/index.js'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext.js'
import { SignUpRoutePath } from '../../pages/SignUp/routePath.js'
import { DesktopMnemonicConfirm } from '../Mnemonic/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'

const useStyles = makeStyles()((theme) => ({
    error: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        color: getMaskColor(theme).redMain,
        borderLeft: `2px solid ${getMaskColor(theme).redMain}`,
    },
}))

export function RestoreFromMnemonic() {
    const navigate = useNavigate()
    const { classes } = useStyles()
    const [error, setError] = useState('')
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const t = useDashboardI18N()
    const [values, { updateAt, set: setMnemonic }] = useList(Array.from({ length: 12 }, () => ''))
    const { fillSubmitOutlet } = usePersonaRecovery()
    const handleWordChange = useCallback((word: string, index: number) => {
        updateAt(index, word)
        setError('')
    }, [])

    const handleImport = useCallback(async () => {
        try {
            const persona = await Services.Identity.queryPersonaByMnemonic(values.join(' '), '')
            if (persona) {
                await changeCurrentPersona(persona)
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
            setError(t.sign_in_account_mnemonic_confirm_failed())
        }
    }, [values, navigate])

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={handleImport}
                disabled={some(values, (value) => !value)}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [handleImport, values])

    return (
        <>
            <Box>
                <DesktopMnemonicConfirm onChange={handleWordChange} puzzleWords={values} setAll={setMnemonic} />
                {error ? (
                    <Typography className={classes.error} variant="body2">
                        {error}
                    </Typography>
                ) : null}
            </Box>
            {/* <ButtonContainer> */}
            {/*     <LoadingButton */}
            {/*         variant="rounded" */}
            {/*         size="large" */}
            {/*         onClick={handleImport} */}
            {/*         disabled={some(values, (value) => !value)}> */}
            {/*         {t.confirm()} */}
            {/*     </LoadingButton> */}
            {/* </ButtonContainer> */}
        </>
    )
}
