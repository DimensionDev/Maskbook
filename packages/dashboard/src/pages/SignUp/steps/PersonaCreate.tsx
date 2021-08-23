import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { MaskTextField } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Box, Button, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { useSnackbarCallback } from '@masknet/shared'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'
import { Services } from '../../../API'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'

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
    const {
        state: { mnemonic },
    } = useLocation() as { state: { mnemonic: string[] } }

    const [personaName, setPersonaName] = useState('')

    useEffect(() => {
        if (!mnemonic || !Services.Identity.validateMnemonic(mnemonic.join(' '))) {
            navigate(RoutePaths.SignUp, { replace: true })
        }
    }, [mnemonic])

    const handleCreatePersona = useSnackbarCallback({
        executor: () => createPersona(mnemonic.join(' '), personaName),
        onSuccess: () => navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`),
        onError: () => navigate(`${RoutePaths.SignUp}`),
        successText: t.create_account_persona_successfully(),
        deps: [],
    })

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_persona_title()}
                subtitle={t.create_account_persona_subtitle()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.SignIn) }}
            />
            <Body>
                <SignUpAccountLogo />
                <Box>
                    <MaskTextField
                        required
                        label={<Label value={t.persona()} />}
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => setPersonaName(e.currentTarget.value)}
                        inputProps={{ maxLength: 24 }}
                    />
                    <ButtonContainer>
                        <Button variant="rounded" color="primary" onClick={handleCreatePersona} disabled={!personaName}>
                            {t.next()}
                        </Button>
                    </ButtonContainer>
                </Box>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
