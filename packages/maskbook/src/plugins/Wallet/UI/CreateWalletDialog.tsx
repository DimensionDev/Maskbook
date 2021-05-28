import { useState, useCallback } from 'react'
import { Button, Box, Card, DialogContent, makeStyles, useTheme, TextField, Typography } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import classNames from 'classnames'
import {
    WALLET_OR_PERSONA_NAME_MAX_LEN,
    checkInputLengthExceed,
    delay,
    useRemoteControlledDialog,
    useI18N,
} from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { WalletMessages, WalletRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useSnackbarCallback } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useMnemonicWordsPuzzle } from '../hooks/useMnemonicWordsPuzzle'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../constants'

enum CreateWalletStep {
    Name = 0,
    Words,
    Verify,
}

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5, 4.5),
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 0, 2),
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
}))

export interface CreateWalletDialogProps extends withClasses<never> {}

export function CreateWalletDialog(props: CreateWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const theme = useTheme()
    const [step, setStep] = useState(CreateWalletStep.Name)
    const [name, setName] = useState('')

    //#region create mnemonic words
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()
    //#endregion

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        if (!ev.name) return
        setName(ev.name)
        setStep(CreateWalletStep.Words)
    })
    const onClose = useCallback(async () => {
        closeDialog()
        await delay(300)
        setName('')
        setStep(CreateWalletStep.Name)
        refreshCallback()
    }, [refreshCallback])
    //#endregion

    const onNext = useCallback(() => {
        switch (step) {
            case CreateWalletStep.Name:
                setStep(CreateWalletStep.Words)
                break
            case CreateWalletStep.Words:
                setStep(CreateWalletStep.Verify)
                break
        }
    }, [step])
    const onBack = useCallback(() => {
        switch (step) {
            case CreateWalletStep.Words:
                setStep(CreateWalletStep.Name)
                break
            case CreateWalletStep.Verify:
                setStep(CreateWalletStep.Words)
                resetCallback()
                break
        }
    }, [step, resetCallback])
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
        [name, words],
        onClose,
    )
    const onWordChange = answerCallback

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_wallet_setup_title_create')}
            DialogProps={{
                maxWidth: step === CreateWalletStep.Name ? 'xs' : 'sm',
            }}>
            <DialogContent className={classes.content}>
                {step !== CreateWalletStep.Name ? (
                    <Typography className={classes.description}>
                        {t(
                            step === CreateWalletStep.Words
                                ? 'plugin_wallet_setup_description_words'
                                : 'plugin_wallet_setup_description_verify',
                        )}
                    </Typography>
                ) : null}
                {step === CreateWalletStep.Name ? (
                    <Box>
                        <TextField
                            className={classes.input}
                            helperText={
                                checkInputLengthExceed(name)
                                    ? t('input_length_exceed_prompt', {
                                          name: t('wallet_name').toLowerCase(),
                                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                      })
                                    : undefined
                            }
                            required
                            autoFocus
                            label={t('wallet_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                    </Box>
                ) : null}
                {step === CreateWalletStep.Words ? (
                    <>
                        <Box className={classes.top}>
                            <Button startIcon={<RefreshIcon />} onClick={refreshCallback}>
                                {t('refresh')}
                            </Button>
                        </Box>
                        <Card
                            className={classNames(classes.card, classes.cardButton)}
                            elevation={0}
                            variant={theme.palette.mode === 'dark' ? 'outlined' : 'elevation'}>
                            {words.map((word, i) => (
                                <Button className={classNames(classes.word, classes.wordButton)} key={i} variant="text">
                                    {word}
                                </Button>
                            ))}
                        </Card>
                    </>
                ) : null}
                {step === CreateWalletStep.Verify ? (
                    <Card className={classNames(classes.card, classes.cardTextfield)} elevation={0}>
                        {puzzleWords.map((word, i) => (
                            <TextField
                                className={classNames(classes.word, classes.wordTextfield)}
                                key={i}
                                size="small"
                                value={word}
                                autoFocus={indexes.sort((a, z) => a - z).indexOf(i) === 0}
                                disabled={!indexes.includes(i)}
                                variant="outlined"
                                onChange={(ev) => onWordChange(ev.target.value, indexes.indexOf(i))}>
                                {word}
                            </TextField>
                        ))}
                    </Card>
                ) : null}
                <Box className={classes.bottom}>
                    {step === CreateWalletStep.Words || step === CreateWalletStep.Verify ? (
                        <ActionButton
                            color="primary"
                            variant="text"
                            onClick={onBack}
                            style={{
                                marginRight: 16,
                            }}>
                            {t('plugin_wallet_setup_back')}
                        </ActionButton>
                    ) : null}
                    <ActionButton
                        variant="contained"
                        disabled={
                            (step === CreateWalletStep.Name && !name) ||
                            (step === CreateWalletStep.Verify && words.join(' ') !== puzzleWords.join(' '))
                        }
                        onClick={step === CreateWalletStep.Name || step === CreateWalletStep.Words ? onNext : onSubmit}>
                        {step === CreateWalletStep.Name
                            ? t('plugin_wallet_setup_create')
                            : step === CreateWalletStep.Words
                            ? t('plugin_wallet_setup_next')
                            : t('plugin_wallet_setup_verify')}
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
