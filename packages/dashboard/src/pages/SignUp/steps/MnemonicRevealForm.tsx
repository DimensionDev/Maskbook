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
import { Button, makeStyles } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { DesktopMnemonicConfirm, MnemonicRevealLG } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import RefreshIcon from '@material-ui/icons/Refresh'
import { memo, useState } from 'react'

const useStyles = makeStyles((theme) => ({
    refresh: {
        paddingBottom: 32,
        textAlign: 'right',
    },
}))

enum CreateWalletStep {
    NameAndWords = 0,
    Verify,
}

export const MnemonicRevealForm = memo(() => {
    const [step, setStep] = useState(CreateWalletStep.NameAndWords)
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const classes = useStyles()
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const onSubmit = () => {
        navigate(`${SignUpRoutePath.PersonaCreate}`, {
            replace: true,
            state: {
                words: words,
            },
        })
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
                        <div className={classes.refresh}>
                            <Button variant={'text'} startIcon={<RefreshIcon />} onClick={refreshCallback}>
                                {t.refresh()}
                            </Button>
                        </div>
                        <MnemonicRevealLG words={words} />
                        <ButtonGroup>
                            <Button color={'secondary'}>Back</Button>
                            <Button color={'primary'} onClick={() => setStep(CreateWalletStep.Verify)}>
                                Next
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
                {step === CreateWalletStep.Verify && (
                    <div>
                        <DesktopMnemonicConfirm indexes={indexes} puzzleWords={puzzleWords} onChange={answerCallback} />
                        <ButtonGroup>
                            <Button color={'secondary'} onClick={onBack}>
                                Back
                            </Button>
                            <Button
                                color={'primary'}
                                disabled={words.join(' ') !== puzzleWords.join(' ')}
                                onClick={onSubmit}>
                                Next
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
                <MaskAlert description={t.create_account_identity_warning()} />
            </Body>
            <Footer></Footer>
        </ColumnContentLayout>
    )
})
