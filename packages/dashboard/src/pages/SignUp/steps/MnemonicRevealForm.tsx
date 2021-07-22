import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import { DesktopMnemonicConfirm, MnemonicRevealLG } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import RefreshIcon from '@material-ui/icons/Refresh'
import { memo, useState } from 'react'
import { some } from 'lodash-es'
import { useSnackbar } from '@masknet/theme'
import { ButtonGroup } from '../../../components/RegisterFrame/ButtonGroup'

enum CreateWalletStep {
    NameAndWords = 0,
    Verify,
}

export const MnemonicRevealForm = memo(() => {
    const [step, setStep] = useState(CreateWalletStep.NameAndWords)
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const t = useDashboardI18N()
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

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
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.Login) }}
            />
            <Body>
                <SignUpAccountLogo />
                {step === CreateWalletStep.NameAndWords && (
                    <div>
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ marginBottom: (theme) => theme.spacing(4) }}>
                            <Button variant="text" startIcon={<RefreshIcon />} onClick={refreshCallback}>
                                {t.refresh()}
                            </Button>
                        </Stack>
                        <MnemonicRevealLG words={words} />
                        <ButtonGroup>
                            <Button variant="rounded" color="secondary">
                                Back
                            </Button>
                            <Button variant="rounded" color="primary" onClick={() => setStep(CreateWalletStep.Verify)}>
                                Verify
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
                {step === CreateWalletStep.Verify && (
                    <div>
                        <DesktopMnemonicConfirm indexes={indexes} puzzleWords={puzzleWords} onChange={answerCallback} />
                        <ButtonGroup>
                            <Button variant="rounded" color="secondary" onClick={onBack}>
                                Back
                            </Button>
                            <Button
                                sx={{ width: '224px' }}
                                variant="rounded"
                                color="primary"
                                disabled={some(puzzleWords, (word) => !word)}
                                onClick={onSubmit}>
                                Confirm
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
                <MaskAlert description={t.create_account_identity_warning()} type="error" />
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
})
