import { useState, useMemo } from 'react'
import { Box, Button, DialogContent, TextField, DialogActions } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { MnemonicTab } from './MnemonicTab'
import { FromPrivateKey, RecoverResult } from './FromPrivateKey'
import { WalletMessages, WalletRPC } from '../../messages'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../../constants'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'

const useStyles = makeStyles()((theme) => ({
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
    actionButton: {},
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

export interface ImportWalletDialogProps extends withClasses<never> {}

export function ImportWalletDialog(props: ImportWalletDialogProps) {
    const { t } = useI18N()
    const [name, setName] = useState('')
    const classes = useStylesExtends(useStyles(), props)
    const [walletFromPrivateKey, setWalletFromPrivateKey] = useState<Partial<RecoverResult>>({})

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)
    const { openDialog: openCreateImportDialog } = useRemoteControlledDialog(
        WalletMessages.events.createImportWalletDialogUpdated,
    )

    const [words, setWords] = useState<string[]>(BLANK_WORDS)
    const tabState = useState(0)
    const tabs: AbstractTabProps['tabs'] = useMemo(
        () => [
            {
                label: t('mnemonic_words'),
                children: <MnemonicTab words={words} onChange={setWords} />,
            },
            {
                label: t('private_key'),
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

    const resetState = () => {
        setWords((list) => list.map(() => ''))
        setName('')
    }

    const backToPrevious = () => {
        closeDialog()
        resetState()
        openCreateImportDialog()
    }

    const handleImport = useSnackbarCallback(
        async () => {
            switch (tabState[0]) {
                case 0:
                    await WalletRPC.importNewWallet({
                        name,
                        path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                        mnemonic: words,
                        passphrase: '',
                    })
                    try {
                        await WalletRPC.addPhrase({
                            path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                            mnemonic: words,
                            passphrase: '',
                        })
                    } catch (error) {
                        if (error instanceof Error && error.message !== 'Add exists phrase.') {
                            throw error
                        }
                    }
                    break
                case 1:
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
        },
        [tabState[0], name, words, walletFromPrivateKey.privateKeyValid, walletFromPrivateKey.privateKey],
        () => {
            closeDialog()
            resetState()
        },
    )

    const importable: boolean = useMemo(() => {
        if (!name) {
            return false
        }
        switch (tabState[0]) {
            case 0:
                return words.filter(Boolean).length === 12
            case 1:
                return !!walletFromPrivateKey.privateKeyValid
        }
        return false
    }, [name, tabState[0], words, walletFromPrivateKey.privateKeyValid])

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('import_wallet')} maxWidth="sm">
            <DialogContent className={classes.content}>{importWallet}</DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button className={classes.actionButton} variant="contained" fullWidth onClick={backToPrevious}>
                    {t('plugin_wallet_import_wallet_previous')}
                </Button>
                <Button
                    className={classes.actionButton}
                    fullWidth
                    variant="contained"
                    onClick={handleImport}
                    disabled={!importable}>
                    {t('plugin_wallet_import_wallet_import')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
