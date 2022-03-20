import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { Button, styled, Tab, tabClasses, Tabs, tabsClasses, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { TabContext, TabPanel } from '@mui/lab'
import { File as FileIcon } from '@masknet/icons'
import { useWallet } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'
import { PasswordField } from '../../../components/PasswordField'
import Services from '../../../../service'

const useStyles = makeStyles()({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 10px',
    },
    title: {
        color: '#15181B',
        fontSize: 12,
        fontHeight: '16px',
    },
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    tabPanel: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
    },
    placeholder: {
        padding: '35px 0',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#F7F9FA',
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
    },
    privateKey: {
        backgroundColor: '#F7F9FA',
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
        borderRadius: 8,
        padding: '10px 14px',
        height: 140,
        wordBreak: 'break-word',
        userSelect: 'text',
    },
    tip: {
        marginTop: 10,
        color: '#FF5F5F',
        fontSize: 12,
        lineHeight: '14px',
    },
})

const StyledTabs = styled(Tabs)`
    &.${tabsClasses.root} {
        min-height: unset;
        background-color: #f7f9fa;
        padding-top: 6px;
    }
    & .${tabsClasses.indicator} {
        display: none;
    }
    & .${tabsClasses.flexContainer} {
        justify-content: center;
    }
`

const StyledTab = styled(Tab)`
    &.${tabClasses.root} {
        font-size: 12px;
        line-height: 16px;
        min-height: unset;
        min-width: 165px;
        padding: 7px 0;
        background-color: #f7f9fa;
        border-radius: 4px 4px 0px 0px;
        color: #15181b;
    }
    &.${tabClasses.selected} {
        background-color: white;
        font-weight: 500;
    }
`

enum BackupTabs {
    JsonFile = 'Json File',
    PrivateKey = 'Private Key',
}

const BackupWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const wallet = useWallet()
    const [currentTab, setCurrentTab] = useState(BackupTabs.JsonFile)
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [{ value: exportValue }, onConfirm] = useAsyncFn(async () => {
        if (!wallet?.hasStoredKeyInfo) return
        try {
            return {
                jsonFile: await WalletRPC.exportKeyStoreJSON(wallet.address, password),
                privateKey: await WalletRPC.exportPrivateKey(wallet.address, password),
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            }
            return
        }
    }, [wallet, password])

    const { jsonFile, privateKey } = exportValue ?? {
        jsonFile: '',
        privateKey: '',
    }

    const [{ value: downloadValue }, onExport] = useAsyncFn(async () => {
        try {
            await Services.Welcome.downloadBackup(jsonFile, 'json')
            return true
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            }
            return false
        }
    }, [jsonFile])

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('popups_wallet_backup_wallet')}</Typography>
                <NetworkSelector />
            </div>
            <div className={classes.content}>
                <TabContext value={currentTab}>
                    <StyledTabs value={currentTab} onChange={(event, tab) => setCurrentTab(tab)}>
                        <StyledTab label={t('popups_wallet_backup_json_file')} value={BackupTabs.JsonFile} />
                        <StyledTab label={t('popups_wallet_backup_private_key')} value={BackupTabs.PrivateKey} />
                    </StyledTabs>
                    {jsonFile ? (
                        <TabPanel
                            value={BackupTabs.JsonFile}
                            className={classes.tabPanel}
                            style={{ flex: currentTab === BackupTabs.JsonFile ? '1' : '0' }}>
                            <div className={classes.placeholder}>
                                <FileIcon style={{ fontSize: 32, width: 32, height: 32 }} />
                            </div>
                            <Typography className={classes.tip}>
                                {t('popups_wallet_backup_json_file_confirm_password_tip')}
                            </Typography>
                        </TabPanel>
                    ) : null}
                    {privateKey ? (
                        <TabPanel
                            value={BackupTabs.PrivateKey}
                            className={classes.tabPanel}
                            style={{ flex: currentTab === BackupTabs.PrivateKey ? '1' : '0' }}>
                            <Typography className={classes.privateKey}>{privateKey ?? ''}</Typography>
                            <Typography className={classes.tip}>{t('popups_wallet_backup_private_key_tip')}</Typography>
                        </TabPanel>
                    ) : null}
                    {!jsonFile && !privateKey ? (
                        <div className={classes.tabPanel} style={{ flex: 1 }}>
                            <Typography className={classes.label}>{t('wallet_confirm_with_password')}</Typography>
                            <PasswordField
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errorMessage}
                                helperText={errorMessage}
                                placeholder={t('popups_wallet_backup_input_password')}
                            />
                        </div>
                    ) : null}
                </TabContext>
            </div>
            {!(privateKey && currentTab === BackupTabs.PrivateKey) ? (
                <div style={{ padding: 16 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        className={classes.button}
                        disabled={!jsonFile && !password}
                        onClick={jsonFile ? onExport : onConfirm}>
                        {jsonFile ? t('export') : t('popups_wallet_next')}
                    </Button>
                </div>
            ) : null}
        </>
    )
})

export default BackupWallet
