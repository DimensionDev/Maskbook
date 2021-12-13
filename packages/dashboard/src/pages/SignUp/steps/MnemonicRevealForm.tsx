import { memo, useState } from 'react'
import { some } from 'lodash-unified'
import { useNavigate } from 'react-router-dom'
import { Button, Stack, Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import {
    Body,
    ColumnContentLayout,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useDashboardI18N } from '../../../locales'
import { DesktopMnemonicConfirm, MnemonicReveal } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle'

enum CreateWalletStep {
    NameAndWords = 0,
    Verify = 1,
}

export const MnemonicRevealForm = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const [step, setStep] = useState(CreateWalletStep.NameAndWords)

    const onSubmit = async () => {
        if (words.join(' ') !== puzzleWords.join(' ')) {
            showSnackbar(t.create_account_mnemonic_confirm_failed(), { variant: 'error' })
        } else {
            navigate(`${SignUpRoutePath.PersonaCreate}`, {
                replace: true,
                state: { mnemonic: words },
            })
        }
    }

    const onBack = () => {
        setStep(CreateWalletStep.NameAndWords)
        resetCallback()
    }

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
                {step === CreateWalletStep.NameAndWords && (
                    <>
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                            <Button variant="text" startIcon={<RefreshIcon />} onClick={refreshCallback}>
                                {t.refresh()}
                            </Button>
                        </Stack>
                        <MnemonicReveal words={words} />
                        <ButtonContainer>
                            <Button
                                size="large"
                                variant="rounded"
                                color="primary"
                                onClick={() => setStep(CreateWalletStep.Verify)}>
                                {t.verify()}
                            </Button>
                        </ButtonContainer>
                    </>
                )}
                {step === CreateWalletStep.Verify && (
                    <>
                        <DesktopMnemonicConfirm indexes={indexes} puzzleWords={puzzleWords} onChange={answerCallback} />
                        <ButtonContainer>
                            <Button variant="rounded" size="large" color="secondary" onClick={onBack}>
                                {t.back()}
                            </Button>
                            <Button
                                sx={{ width: '224px' }}
                                variant="rounded"
                                color="primary"
                                size="large"
                                disabled={some(puzzleWords, (word) => !word)}
                                onClick={onSubmit}>
                                {t.confirm()}
                            </Button>
                        </ButtonContainer>
                    </>
                )}
                <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                    <MaskAlert description={t.create_account_identity_warning()} type="error" />
                </Box>
            </Body>
        </ColumnContentLayout>
    )
})
