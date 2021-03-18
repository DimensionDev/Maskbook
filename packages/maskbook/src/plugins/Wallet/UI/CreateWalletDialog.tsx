import { useState, useCallback } from 'react'
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

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            minHeight: 300,
            padding: theme.spacing(6, 8),
        },
        buttons: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(2, 0),
        },
        card: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: theme.spacing(1, 2, 2),
        },
        word: {
            margin: theme.spacing(1, 0, 0),
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
    }, [setOpen])
    //#endregion

    //#region create mnemonic words
    const { value: words = [], retry: retryWords } = useAsyncRetry(() => WalletRPC.createMnemonicWords(), [])
    const onSubmit = useSnackbarCallback(
        async () => {
            if (step === 1) {
                setStep(1)
                return
            }
            if (!words.length || words.join(' ') !== verification) throw new Error('Failed')
            await WalletRPC.recoverWallet(words, '')
        },
        [step, words, verification],
        onClose,
    )
    const onRefresh = useCallback(() => {
        retryWords()
    }, [retryWords])
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_create_a_wallet')}>
            <DialogContent className={classes.content}>
                <Box className={classes.buttons}>
                    <Button startIcon={<RefreshIcon />} onClick={onRefresh}>
                        {t('refresh')}
                    </Button>
                </Box>
                <Card className={classes.card} variant="outlined">
                    {words.map((word, i) => (
                        <Button className={classes.word} key={i} variant="text">
                            {word}
                        </Button>
                    ))}
                </Card>
            </DialogContent>
            <DialogActions>
                <Button variant="text" onClick={onSubmit}>
                    {t(step === 0 ? 'plugin_wallet_verification_next' : 'plugin_wallet_verification_confirm')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
