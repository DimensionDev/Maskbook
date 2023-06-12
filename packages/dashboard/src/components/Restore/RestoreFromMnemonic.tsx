import { useState } from 'react'
import { useList } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { some } from 'lodash-es'
import { delay } from '@masknet/kit'
import { Box, Typography } from '@mui/material'
import { DashboardRoutes } from '@masknet/shared-base'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { DesktopMnemonicConfirm } from '../Mnemonic/index.js'
import { useDashboardI18N } from '../../locales/index.js'
import { MaskAlert } from '../MaskAlert/index.js'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer.js'
import { Services } from '../../API.js'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext.js'
import { SignUpRoutePath } from '../../pages/SignUp/routePath.js'
import { LoadingButton } from '../LoadingButton/index.js'

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
    const [values, { updateAt, set: setMnemonic }] = useList(Array.from<string>({ length: 12 }).fill(''))

    const handleImport = async () => {
        try {
            const persona = await Services.Identity.queryPersonaByMnemonic(values.join(' '), '')
            if (persona) {
                await changeCurrentPersona(persona)
                // Waiting persona changed event notify
                await delay(100)
                navigate(DashboardRoutes.Personas, { replace: true })
            } else {
                navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.PersonaRecovery}`, {
                    replace: false,
                    state: { mnemonic: values },
                })
            }
        } catch {
            setError(t.sign_in_account_mnemonic_confirm_failed())
        }
    }

    return (
        <>
            <Box>
                <DesktopMnemonicConfirm
                    onChange={(word, index) => {
                        updateAt(index, word)
                        setError('')
                    }}
                    puzzleWords={values}
                    setAll={setMnemonic}
                />
                {error ? (
                    <Typography className={classes.error} variant="body2">
                        {error}
                    </Typography>
                ) : null}
            </Box>
            <ButtonContainer>
                <LoadingButton
                    variant="rounded"
                    size="large"
                    onClick={handleImport}
                    disabled={some(values, (value) => !value)}>
                    {t.confirm()}
                </LoadingButton>
            </ButtonContainer>
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_identity_warning()} />
            </Box>
        </>
    )
}
