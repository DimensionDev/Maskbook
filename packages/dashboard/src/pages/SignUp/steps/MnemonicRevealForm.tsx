import { Body, ColumnContentLayout, SignUpAccountLogo } from '../../../components/RegisterFrame/ColumnContentLayout'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import { DesktopMnemonicConfirm, MnemonicReveal } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import RefreshIcon from '@material-ui/icons/Refresh'
import { memo, useState } from 'react'
import { some } from 'lodash-es'
import { useSnackbar } from '@masknet/theme'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { Box } from '@mui/system'

enum CreateWalletStep {
    NameAndWords = 0,
    Verify = 1,
}

export const MnemonicRevealForm = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const [step, setStep] = useState(CreateWalletStep.NameAndWords)

    const onSubmit = async () => {
        if (words.join(' ') !== puzzleWords.join(' ')) {
            enqueueSnackbar(t.create_account_mnemonic_confirm_failed(), { variant: 'error' })
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
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.SignIn) }}
            />
            <Body>
                <SignUpAccountLogo />
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
