import { DesktopMnemonicConfirm } from '../Mnemonic'
import { useList } from 'react-use'
import { Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { some } from 'lodash-es'
import { MaskAlert } from '../MaskAlert'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { Services } from '../../API'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { RoutePaths } from '../../type'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { getMaskColor } from '@masknet/theme'
import { SignUpRoutePath } from '../../pages/SignUp/routePath'

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
            setError(t.sign_in_account_private_key_error())
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
                <Button
                    variant="rounded"
                    color="primary"
                    onClick={handleImport}
                    disabled={some(values, (value) => !value)}
                >
                    {t.confirm()}
                </Button>
            </ButtonContainer>
            <Box sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_identity_warning()} />
            </Box>
        </>
    )
}
