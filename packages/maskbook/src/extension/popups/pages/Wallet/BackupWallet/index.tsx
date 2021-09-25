import { memo, useState } from 'react'
import { Button, styled, Tab, tabClasses, Tabs, tabsClasses, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { TabContext, TabPanel } from '@material-ui/lab'
import { File as FileIcon } from '@masknet/icons'
import { useWallet } from '@masknet/web3-shared'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'
import PasswordField from '@masknet/dashboard/dist/src/components/PasswordField'

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

    const [{ value: privateKey }, onConfirm] = useAsyncFn(async () => {
        if (!wallet?.hasStoredKeyInfo) return ''
        //TODO: KeyStore
        try {
            return WalletRPC.exportPrivateKey(wallet.address, password)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            }
            return ''
        }
    }, [wallet, password])

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
                    {privateKey ? (
                        <>
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
                            <TabPanel
                                value={BackupTabs.PrivateKey}
                                className={classes.tabPanel}
                                style={{ flex: currentTab === BackupTabs.PrivateKey ? '1' : '0' }}>
                                <Typography className={classes.privateKey}>{privateKey ?? ''}</Typography>
                                <Typography className={classes.tip}>
                                    {t('popups_wallet_backup_private_key_tip')}
                                </Typography>
                            </TabPanel>
                        </>
                    ) : (
                        <div className={classes.tabPanel} style={{ flex: 1 }}>
                            <Typography className={classes.label}>Confirm with password</Typography>
                            <PasswordField
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errorMessage}
                                helperText={errorMessage}
                                placeholder={t('popups_wallet_backup_input_password')}
                            />
                        </div>
                    )}
                </TabContext>
            </div>
            {!(privateKey && currentTab === BackupTabs.PrivateKey) ? (
                <div style={{ padding: 16 }}>
                    {/*TODO: Download*/}
                    <Button
                        variant="contained"
                        fullWidth
                        className={classes.button}
                        disabled={!privateKey && !password}
                        onClick={onConfirm}>
                        {!privateKey ? t('popups_wallet_next') : t('download')}
                    </Button>
                </div>
            ) : null}
        </>
    )
})

export default BackupWallet
