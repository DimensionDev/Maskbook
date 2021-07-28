import { useState, useCallback } from 'react'
import { StepNameAndWords } from './StepNameAndWords'
import { StepVerify } from './StepVerify'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../..'
import { useSnackbarCallback } from '@masknet/shared'

enum CreateWalletStep {
    NameAndWords = 0,
    Verify,
}

export interface CreateWalletUIProps {
    onCreated: () => void
    createNewWallet: (wallet: NewWallet) => Promise<void>
}

export interface NewWallet {
    name: string
    walletPath: string
    phrasePath: string
    mnemonic: string[]
    passphrase: string
}

export function CreateWalletUI({ onCreated, createNewWallet }: CreateWalletUIProps) {
    const [name, setName] = useState('')
    const [step, setStep] = useState(CreateWalletStep.NameAndWords)
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const backToNameAndWords = useCallback(() => {
        setStep(CreateWalletStep.NameAndWords)
        resetCallback()
    }, [resetCallback])

    const goVerify = useCallback(() => {
        setStep(CreateWalletStep.Verify)
    }, [])

    const onSuccess = useCallback(() => {
        resetCallback()
        onCreated()
    }, [resetCallback, onCreated])

    const onSubmit = useSnackbarCallback(
        () => {
            return createNewWallet({
                name,
                phrasePath: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                walletPath: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                mnemonic: words,
                passphrase: '',
            })
        },
        [words, name],
        onSuccess,
    )

    if (step === CreateWalletStep.NameAndWords) {
        return (
            <StepNameAndWords
                name={name}
                words={words}
                onNameChange={setName}
                onRefreshWords={refreshCallback}
                onSubmit={goVerify}
            />
        )
    }
    return (
        <StepVerify
            wordsMatched={words.join(' ') === puzzleWords.join(' ')}
            puzzleWords={puzzleWords}
            indexes={indexes}
            onUpdateAnswerWords={answerCallback}
            onBack={backToNameAndWords}
            onSubmit={onSubmit}
        />
    )
}
