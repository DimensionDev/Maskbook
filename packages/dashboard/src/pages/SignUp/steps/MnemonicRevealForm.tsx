import { memo, useCallback, useState } from 'react'
import { some } from 'lodash-unified'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Stack, Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, delay } from '@masknet/shared-base'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import {
    Body,
    ColumnContentLayout,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useDashboardI18N } from '../../../locales'
import { MnemonicReveal } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { Services } from '../../../API'

export const MnemonicRevealForm = memo(() => {
    const createPersona = useCreatePersonaV2()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { state } = useLocation() as { state: { personaName: string } }
    const { showSnackbar } = useCustomSnackbar()
    const { words, refreshCallback } = useMnemonicWordsPuzzle()

    const onConfirm = useCallback(async () => {
        try {
            const identifier = await createPersona(words.join(' '), state.personaName)

            const privateKey = await Services.Identity.exportPersonaPrivateKey(identifier)
            console.log(identifier.toText(), privateKey)

            await changeCurrentPersona(identifier)
            showSnackbar(t.create_account_persona_successfully(), { variant: 'success' })

            await delay(300)
            navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
        } catch (error) {
            showSnackbar((error as Error).message, { variant: 'error' })
        }
    }, [words, state.personaName])

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_identity_title()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(DashboardRoutes.SignIn) }}
            />
            <Body>
                <PersonaLogoBox>
                    <SignUpAccountLogo />
                </PersonaLogoBox>

                <Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                        <Button variant="text" startIcon={<RefreshIcon />} onClick={refreshCallback}>
                            {t.refresh()}
                        </Button>
                    </Stack>
                    <MnemonicReveal words={words} />
                    <ButtonContainer>
                        <Button size="large" variant="rounded" color="primary" onClick={onConfirm}>
                            {t.create_account_mnemonic_download_or_print()}
                        </Button>
                    </ButtonContainer>
                </Box>

                <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                    <MaskAlert description={t.create_account_identity_warning()} type="info" />
                </Box>
            </Body>
        </ColumnContentLayout>
    )
})
