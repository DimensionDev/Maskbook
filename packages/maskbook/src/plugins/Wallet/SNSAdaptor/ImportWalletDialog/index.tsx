import { useRemoteControlledDialog } from '@masknet/shared'
import { useSnackbarCallback } from '@masknet/shared'
import { Box, Button, DialogActions, DialogContent, makeStyles, TextField } from '@material-ui/core'
import { FC, useMemo, useState } from 'react'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../../constants'
import { WalletMessages, WalletRPC } from '../../messages'
import { FromPrivateKey, RecoverResult } from './FromPrivateKey'
import { MnemonicTab } from './MnemonicTab'

export type { RecoverResult } from './FromPrivateKey'

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
    actionButton: {},
    bodyCell: {
        borderBottom: 'none',
        padding: '0 10px',
    },
}))

export const BLANK_WORDS = Array.from({ length: 12 }).fill('') as string[]

interface ImportWalletUIProps {
    name: string
    onNameChange: (name: string) => void
    words: string[]
    onWordsChange: (words: string[]) => void
    onRecover: (result: Partial<RecoverResult>) => void
    tabState: AbstractTabProps['state']
}

export const ImportWalletUI: FC<ImportWalletUIProps> = ({
    name,
    onNameChange,
    words,
    onWordsChange,
    onRecover,
    tabState,
}) => {
    const { t } = useI18N()
    const classes = useStyles()

    const tabs: AbstractTabProps['tabs'] = useMemo(
        () => [
            {
                label: t('mnemonic_words'),
                children: <MnemonicTab words={words} onChange={onWordsChange} />,
            },
            {
                label: t('private_key'),
                children: <FromPrivateKey onRecover={onRecover} />,
            },
        ],
        [words],
    )
    return (
        <Box>
            <TextField
                className={classes.walletName}
                inputProps={{
                    maxLength: 12,
                }}
                label={t('wallet_name')}
                placeholder={t('plugin_wallet_name_placeholder')}
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
            />
            <AbstractTab tabs={tabs} state={tabState} />
        </Box>
    )
}

enum ImportMode {
    Mnemonic,
    PrivateKey,
}

interface Options {
    name: string
    mode: ImportMode
    words?: string[]
    privateKey?: Partial<RecoverResult>
}

export async function importWallet({ mode, name, words, privateKey }: Options) {
    switch (mode) {
        case ImportMode.Mnemonic:
            await WalletRPC.importNewWallet({
                name,
                path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                mnemonic: words!,
                passphrase: '',
            })
            try {
                await WalletRPC.addPhrase({
                    path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                    mnemonic: words!,
                    passphrase: '',
                })
            } catch (err) {
                if (err.message !== 'Add exists phrase.') {
                    throw err
                }
            }
            break
        case ImportMode.PrivateKey:
            if (!privateKey!.privateKeyValid) {
                return
            }
            await WalletRPC.importNewWallet({
                name,
                address: privateKey!.address,
                _private_key_: privateKey!.privateKey,
            })
            break
    }
}

export interface ImportWalletDialogProps extends withClasses<never> {}

export const TabIndexMap = {
    0: ImportMode.Mnemonic,
    1: ImportMode.PrivateKey,
}

export type TabIndex = keyof typeof TabIndexMap

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
    const importMode = TabIndexMap[tabState[0] as TabIndex]

    const resetState = () => {
        setWords(BLANK_WORDS)
        setName('')
    }

    const backToPrevious = () => {
        closeDialog()
        resetState()
        openCreateImportDialog()
    }

    const handleImport = useSnackbarCallback(
        async () => {
            await importWallet({
                mode: importMode,
                name,
                words,
                privateKey: walletFromPrivateKey,
            })
        },
        [importMode, name, words, walletFromPrivateKey.privateKeyValid, walletFromPrivateKey.privateKey],
        () => {
            closeDialog()
            resetState()
        },
    )

    const importable: boolean = useMemo(() => {
        if (!name) {
            return false
        }
        switch (tabState[0] as TabIndex) {
            case 0:
                return words.filter(Boolean).length === 12
            case 1:
                return !!walletFromPrivateKey.privateKeyValid
        }
    }, [name, tabState[0], words, walletFromPrivateKey.privateKeyValid])

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('import_wallet')} maxWidth="sm">
            <DialogContent className={classes.content}>
                <ImportWalletUI
                    name={name}
                    onNameChange={setName}
                    words={words}
                    onWordsChange={setWords}
                    onRecover={setWalletFromPrivateKey}
                    tabState={tabState}
                />
            </DialogContent>
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
