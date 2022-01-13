import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MaskTextField } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { DashboardRoutes } from '@masknet/shared-base'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Box, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
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

    const [personaName, setPersonaName] = useState('')

    const onNext = async () => {
        await navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.MnemonicReveal}`, {
            replace: true,
            state: {
                personaName,
            },
        })
    }

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_persona_title()}
                subtitle={t.create_account_persona_subtitle()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(DashboardRoutes.SignIn) }}
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
                    />
                    <ButtonContainer>
                        <LoadingButton
                            size="large"
                            variant="rounded"
                            color="primary"
                            onClick={onNext}
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
