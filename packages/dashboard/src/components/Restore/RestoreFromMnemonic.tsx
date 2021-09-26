import { DesktopMnemonicConfirm } from '../Mnemonic'
import { useList } from 'react-use'
import { Box, Typography } from '@material-ui/core'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { some } from 'lodash-es'
import { MaskAlert } from '../MaskAlert'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { Services } from '../../API'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { RoutePaths } from '../../type'
import { useNavigate } from 'react-router'
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
    const [values, { updateAt }] = useList(Array.from<string>({ length: 12 }).fill(''))

    const handleImport = async () => {
        try {
            const persona = await Services.Identity.queryPersonaByMnemonic(values.join(' '), '')
            if (persona) {
                await changeCurrentPersona(persona.identifier)
                navigate(RoutePaths.Personas, { replace: true })
            } else {
                navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.PersonaCreate}`, {
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
                    color="primary"
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
