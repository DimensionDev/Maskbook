import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Box, Button, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { Services } from '../../../API'

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
    const [error, setError] = useState('')

    const onNext = async () => {
        const personas = await Services.Identity.queryMyPersonas()
        let existing = false
        for (const i in personas) {
            if (personas[i].nickname === personaName) {
                existing = true
                break
            }
        }

        if (existing) {
            return setError(t.create_account_persona_exists())
        }

        navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.MnemonicReveal}`, {
            replace: true,
            state: {
                personaName,
            },
        })
    }

    useEffect(() => {
        setError('')
    }, [personaName])

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
                        error={!!error}
                        helperText={error}
                    />
                    <ButtonContainer>
                        <Button size="large" variant="rounded" color="primary" onClick={onNext} disabled={!personaName}>
                            {t.next()}
                        </Button>
                    </ButtonContainer>
                </Box>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
