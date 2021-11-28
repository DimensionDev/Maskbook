import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MaskTextField, useCustomSnackbar } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Box, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { delay } from '@masknet/shared'
import { useCreatePersonaByPrivateKey, useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'
import { Services } from '../../../API'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { LoadingButton } from '../../../components/LoadingButton'

const Label = ({ value }: { value: string }) => (
    <Typography
        variant="body2"
        sx={{ marginBottom: '8px', fontWeight: 'bolder', color: (theme) => theme.palette.primary.main }}>
        {value}
    </Typography>
)

export const PersonaCreate = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const createPersona = useCreatePersonaV2()
    const createPersonaByPrivateKey = useCreatePersonaByPrivateKey()
    const { showSnackbar } = useCustomSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const { state } = useLocation() as { state: { mnemonic: string[]; privateKey: string } }

    const [personaName, setPersonaName] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (
            (!state?.mnemonic || !Services.Identity.validateMnemonic(state?.mnemonic.join(' '))) &&
            !state?.privateKey
        ) {
            navigate(RoutePaths.SignUp, { replace: true })
        }
    }, [state?.mnemonic, state?.privateKey])

    const create = useCallback(async () => {
        try {
            const identifier = state?.mnemonic
                ? await createPersona(state?.mnemonic.join(' '), personaName)
                : await createPersonaByPrivateKey(state?.privateKey, personaName)

            await changeCurrentPersona(identifier)
            showSnackbar(t.create_account_persona_successfully(), { variant: 'success' })

            await delay(300)
            navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
        } catch (error) {
            setError((error as Error).message)
        }
    }, [state?.mnemonic, state?.privateKey, personaName])

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_persona_title()}
                subtitle={t.create_account_persona_subtitle()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.SignIn) }}
            />
            <Body>
                <PersonaLogoBox>
                    <SignUpAccountLogo />
                </PersonaLogoBox>
                <Box>
                    <MaskTextField
                        required
                        label={<Label value={t.persona()} />}
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => setPersonaName(e.currentTarget.value)}
                        inputProps={{ maxLength: 24 }}
                        error={!!error}
                        helperText={error}
                    />
                    <ButtonContainer>
                        <LoadingButton
                            size="large"
                            variant="rounded"
                            color="primary"
                            onClick={create}
                            disabled={!personaName}>
                            {t.next()}
                        </LoadingButton>
                    </ButtonContainer>
                </Box>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
