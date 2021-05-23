import { useState, useMemo } from 'react'
import { Box, Button, DialogContent, makeStyles, TextField, DialogActions } from '@material-ui/core'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { MnemonicTab } from './MnemonicTab'
import { FromJson } from './FromJson'
import { FromPrivateKey, RecoverResult } from './FromPrivateKey'
import { WalletMessages, WalletRPC } from '../../messages'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../../constants'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { ImportResult } from './ImportResult'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(4, 5, 1),
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        color: '#15181B',
        padding: theme.spacing(0, 1),
    },
    walletName: {
        width: '100%',
    },
    dialogActions: {
        alignItems: 'center',
        padding: theme.spacing(3, 5),
    },
    actionButton: {
        backgroundColor: '#1C68F3',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
        '&:disabled': {
            color: '#ffffff',
            backgroundColor: '#1C68F3',
            opacity: 0.5,
        },
    },
    headCell: {
        borderBottom: 'none',
        backgroundColor: '#F3F3F4',
    },
    bodyCell: {
        borderBottom: 'none',
        padding: '0 10px',
    },
}))

const BLANK_WORDS = Array.from({ length: 12 }).fill('') as string[]

enum ImportStep {
    Import = 0,
    Result,
}

export interface ImportWalletDialogProps extends withClasses<never> {}

export function ImportWalletDialog(props: ImportWalletDialogProps) {
    const { t } = useI18N()
    const [name, setName] = useState('')
    const [step, setStep] = useState<ImportStep>(ImportStep.Import)
    const classes = useStylesExtends(useStyles(), props)
    const [walletFromPrivateKey, setWalletFromPrivateKey] = useState<Partial<RecoverResult>>({})

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)

    const [words, setWords] = useState<string[]>(BLANK_WORDS)
    const tabState = useState(0)
    const tabs: AbstractTabProps['tabs'] = useMemo(
        () => [
            {
                label: 'Mnemonic Words',
                children: <MnemonicTab words={words} onChange={setWords} />,
            },
            {
                label: 'JSON File',
                children: <FromJson />,
            },
            {
                label: 'Private Key',
                children: <FromPrivateKey onRecover={setWalletFromPrivateKey} />,
            },
        ],
        [words],
    )

    const importWallet = (
        <Box>
            <TextField
                className={classes.walletName}
                inputProps={{
                    maxLength: 12,
                }}
                label={t('wallet_name')}
                placeholder={t('plugin_wallet_name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <AbstractTab tabs={tabs} state={tabState} />
        </Box>
    )

    const handleImport = async () => {
        switch (tabState[0]) {
            case 0:
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
                break
            case 2:
                if (!walletFromPrivateKey.privateKeyValid) {
                    return
                }
                await WalletRPC.importNewWallet({
                    name,
                    address: walletFromPrivateKey.address,
                    _private_key_: walletFromPrivateKey.privateKey,
                })
                break
        }
        setStep(ImportStep.Result)
    }

    const isImportStep = step === ImportStep.Import

    const importable: boolean = useMemo(() => {
        if (!name) {
            return false
        }
        switch (tabState[0]) {
            case 0:
                return words.filter(Boolean).length === 12
            case 1:
                return false
            case 2:
                return !!walletFromPrivateKey.privateKeyValid
        }
        return false
    }, [tabState[0], walletFromPrivateKey.privateKeyValid])

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t('import_wallet')}
            DialogProps={{
                maxWidth: 'sm',
            }}>
            <DialogContent className={classes.content}>{isImportStep ? importWallet : <ImportResult />}</DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button fullWidth className={classes.actionButton}>
                    Previous
                </Button>
                <Button
                    fullWidth
                    className={classes.actionButton}
                    onClick={handleImport}
                    disabled={isImportStep && !importable}>
                    {isImportStep ? 'Import' : 'Next'}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
