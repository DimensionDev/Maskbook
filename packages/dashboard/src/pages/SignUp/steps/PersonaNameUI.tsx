import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionButton, MaskTextField } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader.js'
import { Box, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../locales/index.js'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer.js'

function Label({ value }: { value: string }) {
    return (
        <Typography
            variant="body2"
            sx={{ marginBottom: '8px', fontWeight: 'bolder', color: (theme) => theme.palette.primary.main }}>
            {value}
        </Typography>
    )
}

export interface PersonaNameUIProps {
    error?: string
    onNext(personaName: string): void
    loading?: boolean
}

export function PersonaNameUI({ onNext, error, loading }: PersonaNameUIProps) {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const [personaName, setPersonaName] = useState('')
    const [helper, setHelper] = useState('')

    useEffect(() => {
        setHelper('')
    }, [personaName])

    useEffect(() => {
        if (error) setHelper(error)
    }, [error])

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
                        error={!!helper}
                        helperText={helper}
                    />
                    <ButtonContainer>
                        <ActionButton
                            loading={loading}
                            size="large"
                            variant="rounded"
                            color="primary"
                            onClick={() => onNext(personaName)}
                            disabled={!personaName || loading}>
                            {t.next()}
                        </ActionButton>
                    </ButtonContainer>
                </Box>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
