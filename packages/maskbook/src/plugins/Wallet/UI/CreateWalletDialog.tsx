import { useState, useCallback, useMemo } from 'react'
import { drop, filter, findIndex, has, indexOf, remove, shuffle } from 'lodash-es'
import { Button, Box, Card, Chip, createStyles, DialogActions, DialogContent, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages, WalletRPC } from '../messages'
import { useWallet, useWallets } from '../hooks/useWallet'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import type { WalletRecord } from '../database/types'
import Services from '../../../extension/service'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { sleep } from '../../../utils/utils'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from '../settings'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { selectMaskbookWallet } from '../helpers'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import { useAsyncRetry } from 'react-use'
import RefreshIcon from '@material-ui/icons/Refresh'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

enum CreateWalletStep {
    Intial = 0,
    Verify,
}

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            minHeight: 300,
            padding: theme.spacing(6, 8),
        },
        top: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(2, 0),
        },
        bottom: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(4, 0, 0),
        },
        card: {
            minHeight: 140,
            display: 'flex',
            flexFlow: 'row wrap',
            alignContent: 'flex-start',
            padding: theme.spacing(1, 2, 2),
        },
        word: {
            width: 101,
            margin: theme.spacing(1, 0.5, 0),
        },
    }),
)

export interface CreateWalletDialogProps extends withClasses<never> {}

export function CreateWalletDialog(props: CreateWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [step, setStep] = useState(0)
    const [verification, setVerification] = useState('')

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
        setStep(CreateWalletStep.Intial)
    }, [setOpen])
    //#endregion

    //#region create mnemonic words
    const { value: words = [], loading: wordsLoading, retry: wordsRetry } = useAsyncRetry(
        () => WalletRPC.createMnemonicWords(),
        [],
    )
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])
    const shuffledWords = useMemo(() => shuffle(words), [words])
    const selectedWords = useMemo(() => selectedIndexes.map((x) => shuffledWords[x]), [selectedIndexes, shuffledWords])
    const onNext = useCallback(() => {
        setStep(CreateWalletStep.Verify)
    }, [])
    const onSubmit = useSnackbarCallback(
        async () => {
            if (!words.length || words.join(' ') !== verification) throw new Error('Failed')
            await WalletRPC.recoverWallet(words, '')
        },
        [step, words, verification],
        onClose,
    )
    const onRefresh = useCallback(() => {
        wordsRetry()
    }, [wordsRetry])
    const onClickWord = useCallback(
        (word: string, index: number) => {
            if (indexOf(selectedIndexes, index) > -1) setSelectedIndexes(filter(selectedIndexes, (x) => x !== index))
            else setSelectedIndexes([...selectedIndexes, index])
        },
        [selectedIndexes],
    )

    console.log(selectedIndexes)
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_create_a_wallet')}>
            <DialogContent className={classes.content}>
                {step === CreateWalletStep.Intial ? (
                    <Box className={classes.top}>
                        <Button startIcon={<RefreshIcon />} onClick={onRefresh}>
                            {t('refresh')}
                        </Button>
                    </Box>
                ) : null}
                <Card className={classes.card} variant="outlined">
                    {(step === CreateWalletStep.Intial ? words : selectedWords).map((word, i) => (
                        <Button className={classes.word} key={i} variant="text">
                            {word}
                        </Button>
                    ))}
                </Card>
                {step === CreateWalletStep.Intial ? null : (
                    <Card className={classes.card} elevation={0}>
                        {shuffledWords.map((word, i) => (
                            <Button
                                className={classes.word}
                                key={i}
                                variant={indexOf(selectedIndexes, i) > -1 ? 'contained' : 'outlined'}
                                onClick={() => onClickWord(word, i)}>
                                {word}
                            </Button>
                        ))}
                    </Card>
                )}
                <Box className={classes.bottom}>
                    <ActionButton
                        variant="contained"
                        disabled={step === CreateWalletStep.Verify && selectedWords.join(' ') !== words.join(' ')}
                        onClick={step === CreateWalletStep.Intial ? onNext : onSubmit}>
                        {t(
                            step === CreateWalletStep.Intial
                                ? 'plugin_wallet_verification_next'
                                : 'plugin_wallet_verification_confirm',
                        )}
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
