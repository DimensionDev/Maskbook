import { useTabsUnstyled } from '@masknet/theme'
import { Box, Button, DialogActions, makeStyles, Tabs, Tab, TextField } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { useI18N } from '../../locales'
import { FromPrivateKey } from './FromPrivateKey'
import { MnemonicTab } from './MnemonicTab'
import { useAsync } from 'react-use'

const useStyles = makeStyles({
    walletName: {
        width: '100%',
    },
    tabs: { minHeight: 200 },
})

export const BLANK_WORDS = Array.from({ length: 12 }).fill('') as string[]

export interface ImportWalletUIProps {
    onBack?: () => void
    onImportMnemonic(name: string, mnemonic: readonly string[]): void
    onImportPrivateKey(key: string, privateKey: string): void
    isPrivateKeyValid(key: string): Promise<boolean>
}
export interface ImportWalletUIRef {
    reset(): void
}
export const ImportWalletUI = forwardRef<ImportWalletUIRef, ImportWalletUIProps>((props, ref) => {
    const t = useI18N()
    const classes = useStyles()

    const [name, onNameChange] = useState<string>('')

    const [words, onWordsChange] = useState<readonly string[]>(BLANK_WORDS)
    const mnemonicValid = words.filter(Boolean).length === 12

    const [privateKey, setPrivateKey] = useState('')
    const { value: privateKeyValid = false } = useAsync(() => {
        if (!privateKey) return Promise.resolve(false)
        return props.isPrivateKeyValid(privateKey)
    }, [privateKey, props.isPrivateKeyValid])

    const { currentTab, setTab, PanelProps, TabProps, TabsProps } = useTabsUnstyled(t.import_wallet(), {
        mnemonic: {
            label: t.mnemonic_words(),
            panel: <MnemonicTab words={words} onChange={onWordsChange} />,
        },
        privateKey: {
            label: t.private_key(),
            panel: <FromPrivateKey privateKey={privateKey} setPrivateKey={setPrivateKey} valid={privateKeyValid} />,
        },
    })

    useImperativeHandle(
        ref,
        () => ({
            reset() {
                onNameChange('')
                onWordsChange(BLANK_WORDS)
                setPrivateKey('')
                setTab('mnemonic')
            },
        }),
        [],
    )
    const importValid = currentTab === 'mnemonic' ? mnemonicValid : privateKeyValid

    return (
        <Box>
            <TextField
                className={classes.walletName}
                inputProps={{
                    maxLength: 12,
                }}
                label={t.wallet_name()}
                placeholder={t.wallet_name_placeholder()}
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
            />
            <TabContext value={currentTab}>
                <Tabs variant="fullWidth" {...TabsProps}>
                    {TabProps.map((prop) => (
                        <Tab {...prop} />
                    ))}
                </Tabs>
                {PanelProps.map((prop) => (
                    <TabPanel {...prop} classes={{ root: classes.tabs }} />
                ))}
            </TabContext>
            {/* Note: there is a bit semantic mismatch. */}
            {/* In old dashboard, this component is in a dialog */}
            {/* But in new dashboard it is not the case. */}
            <DialogActions>
                {props.onBack ? (
                    <Button variant="contained" fullWidth onClick={props.onBack}>
                        {t.import_wallet_previous()}
                    </Button>
                ) : null}
                <Button
                    disabled={!Boolean(name.length && importValid)}
                    fullWidth
                    variant="contained"
                    onClick={
                        currentTab === 'mnemonic'
                            ? () => props.onImportMnemonic(name, words)
                            : () => props.onImportPrivateKey(name, privateKey)
                    }>
                    {t.import_wallet_import()}
                </Button>
            </DialogActions>
        </Box>
    )
})
