import { DesktopMnemonicConfirm } from '../Mnemonic'
import { useAsyncFn, useList } from 'react-use'
import { Box, Typography } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { some } from 'lodash-unified'
import { MaskAlert } from '../MaskAlert'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { Services } from '../../API'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { DashboardRoutes } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { SignUpRoutePath } from '../../pages/SignUp/routePath'
import { LoadingButton } from '../LoadingButton'

const useStyles = makeStyles()((theme) => ({
    error: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        color: getMaskColor(theme).redMain,
        borderLeft: `2px solid ${getMaskColor(theme).redMain}`,
    },
}))

export const RestoreFromMnemonic = () => {
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
                await changeCurrentPersona(persona.identifier)
                navigate(DashboardRoutes.Personas, { replace: true })
            } else {
                navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.PersonaCreate}`, {
                    replace: false,
                    state: { mnemonic: values },
                })
            }
        } catch {
            setError(t.sign_in_account_mnemonic_confirm_failed())
        }
    }
    const [{ loading }, onConfirmClick] = useAsyncFn(() => handleImport())

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
                {error && (
                    <Typography className={classes.error} variant="body2">
                        {error}
                    </Typography>
                )}
            </Box>
            <ButtonContainer>
                <LoadingButton
                    variant="rounded"
                    size="large"
                    onClick={onConfirmClick}
                    disabled={some(values, (value) => !value)}
                    loading={loading}>
                    {t.confirm()}
                </LoadingButton>
            </ButtonContainer>
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_identity_warning()} />
            </Box>
        </>
    )
}
