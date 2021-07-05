import { useState, useCallback } from 'react'
import { DialogContent, makeStyles } from '@material-ui/core'
import { delay, useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { WalletMessages, WalletRPC } from '../../messages'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../../constants'

import { StepNameAndWords } from './StepNameAndWords'
import { StepVerify } from './StepVerify'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'

enum CreateWalletStep {
    NameAndWords = 0,
    Verify,
}

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5, 4.5),
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(2, 0, 1),
    },
    bottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4, 0, 0),
    },
    description: {},
    input: {
        width: '100%',
    },
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
    },
    cardButton: {
        padding: theme.spacing(1, 2, 3),
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.grey[50],
    },
    cardTextfield: {
        justifyContent: 'space-between',
    },
    word: {
        width: 101,
        minWidth: 101,
        whiteSpace: 'nowrap',
        marginTop: theme.spacing(2),
    },
    wordButton: {
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.common.white,
    },
    wordTextfield: {
        width: 110,
    },
    confirmation: {
        fontSize: 12,
        lineHeight: 1.75,
    },
    warning: {
        marginTop: theme.spacing(2),
    },
}))

interface CreateWalletUIProps {
    onCreated: () => void
}

export function CreateWalletUI({ onCreated }: CreateWalletUIProps) {
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
        async () => {
            await WalletRPC.importNewWallet({
                name,
                path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                mnemonic: words,
                passphrase: '',
            })
            await WalletRPC.addPhrase({
                path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
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

export interface CreateWalletDialogProps extends withClasses<never> {}

export function CreateWalletDialog(props: CreateWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated)
    const onClose = useCallback(async () => {
        closeDialog()
        await delay(300)
    }, [])
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_setup_title_create')} maxWidth="sm">
            <DialogContent className={classes.content}>
                <CreateWalletUI onCreated={onClose} />
            </DialogContent>
        </InjectedDialog>
    )
}
