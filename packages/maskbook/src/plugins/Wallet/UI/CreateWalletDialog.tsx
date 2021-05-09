import { useState, useCallback } from 'react'
import {
    Alert,
    Button,
    Box,
    Card,
    Checkbox,
    DialogContent,
    FormControlLabel,
    makeStyles,
    useTheme,
    TextField,
    Typography,
} from '@material-ui/core'
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
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useMnemonicWordsPuzzle } from '../hooks/useMnemonicWordsPuzzle'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../constants'

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

export interface CreateWalletDialogProps extends withClasses<never> {}

export function CreateWalletDialog(props: CreateWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const theme = useTheme()
    const [step, setStep] = useState(CreateWalletStep.NameAndWords)
    const [name, setName] = useState('')
    const [confirmed, setConfirmed] = useState(false)

    //#region create mnemonic words
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()
    //#endregion

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        if (!ev.name) return
        setName(ev.name)
        setStep(CreateWalletStep.Verify)
    })
    const onClose = useCallback(async () => {
        closeDialog()
        await delay(300)
        setName('')
        setStep(CreateWalletStep.NameAndWords)
        refreshCallback()
    }, [refreshCallback])
    //#endregion

    const onNext = useCallback(() => {
        switch (step) {
            case CreateWalletStep.NameAndWords:
                setStep(CreateWalletStep.Verify)
                break
        }
    }, [step])
    const onBack = useCallback(() => {
        switch (step) {
            case CreateWalletStep.Verify:
                setStep(CreateWalletStep.NameAndWords)
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
                maxWidth: 'sm',
            }}>
            <DialogContent className={classes.content}>
                {step !== CreateWalletStep.NameAndWords ? (
                    <Typography className={classes.description}>
                        {t('plugin_wallet_setup_description_verify')}
                    </Typography>
                ) : null}
                {step === CreateWalletStep.NameAndWords ? (
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
                        <Box className={classes.top}>
                            <Typography variant="body1">Mnemonic</Typography>
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
                    </Box>
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
                {step === CreateWalletStep.NameAndWords && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={confirmed}
                                onChange={() => setConfirmed((confirmed) => !confirmed)}
                            />
                        }
                        label={
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'flex-start',
                                }}>
                                <Typography className={classes.confirmation} variant="body2">
                                    I have securely written down my mnemonic word, I understand that lost mnemonic word
                                    cannot be recovered.
                                </Typography>
                            </Box>
                        }
                    />
                )}

                <Box className={classes.bottom}>
                    {step === CreateWalletStep.Verify ? (
                        <ActionButton
                            fullWidth
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
                        fullWidth
                        disabled={
                            (step === CreateWalletStep.NameAndWords && !name) ||
                            (step === CreateWalletStep.Verify && words.join(' ') !== puzzleWords.join(' '))
                        }
                        onClick={step === CreateWalletStep.NameAndWords ? onNext : onSubmit}>
                        {step === CreateWalletStep.NameAndWords
                            ? t('plugin_wallet_setup_create')
                            : t('plugin_wallet_setup_verify')}
                    </ActionButton>
                </Box>
                {step === CreateWalletStep.NameAndWords && (
                    <Box className={classes.warning}>
                        <Alert severity="warning">Please properly back up your account’s mnemonic.</Alert>
                    </Box>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
