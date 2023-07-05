import { DashboardRoutes } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import type { UseFormSetError } from 'react-hook-form'
import { Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { RestoreFromPrivateKey, type FormInputs } from '../../../components/Restore/RestoreFromPrivateKey.js'
import { RecoveryContext, RecoveryProvider } from '../../../contexts/index.js'
import { RestoreFromMnemonic } from '../../../components/Restore/RestoreFromMnemonic.js'
import { PluginServices } from '../../../API.js'
import { walletName } from '../constants.js'
import { RestoreWalletFromLocal } from '../../../components/Restore/RestoreWalletFromLocal.js'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    tabContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
        borderRadius: theme.spacing(1, 1, 0, 0),
        overflow: 'hidden',
    },
    tabList: {
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        padding: theme.spacing('14px', 2, 0),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        width: '100%',
    },
    panelContainer: {
        padding: theme.spacing(2),
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
    between: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    helveticaBold: {
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    create: {
        fontSize: 14,
        cursor: 'pointer',
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
}))

const Recovery = memo(function Recovery() {
    const t = useDashboardI18N()
    const { cx, classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()
    const [error, setError] = useState('')

    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local')

    const handleRestoreFromMnemonic = useCallback(
        async (values: string[]) => {
            try {
                const mnemonic = values.join(' ')
                await PluginServices.Wallet.getDerivableAccounts(mnemonic, 0, 1)

                navigate(DashboardRoutes.AddDeriveWallet, {
                    replace: false,
                    state: { mnemonic },
                })
            } catch {
                setError(t.wallet_recovery_mnemonic_confirm_failed())
            }
        },
        [navigate],
    )

    const handleRestoreFromPrivateKey = useCallback(
        async (data: FormInputs, onError: UseFormSetError<FormInputs>) => {
            try {
                await PluginServices.Wallet.recoverWalletFromPrivateKey(walletName, data.privateKey)
                navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
            } catch {
                onError('privateKey', { type: 'value', message: t.sign_in_account_private_key_error() })
            }
        },
        [walletName, navigate],
    )

    const handleRestoreFromLocalStore = useCallback(
        async (keyStoreContent: string, keyStorePassword: string) => {
            try {
                const address = await PluginServices.Wallet.recoverWalletFromKeyStoreJSON(
                    walletName,
                    keyStoreContent,
                    keyStorePassword,
                )
                await PluginServices.Wallet.resolveMaskAccount([{ address }])
                navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
            } catch {
                setError(t.create_wallet_key_store_incorrect_password())
            }
        },
        [walletName],
    )

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.CreateMaskWalletMnemonic)
    }, [])

    return (
        <Box>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.helveticaBold)}>
                    {t.create_step({ step: '2', total: '2' })}
                </Typography>
                <Typography className={cx(classes.create, classes.helveticaBold)} onClick={handleRecovery}>
                    {t.create()}
                </Typography>
            </div>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    {t.wallet_recovery_title()}
                </Typography>
            </Box>

            <Typography className={classes.second} mt={2}>
                {t.wallet_recovery_description()}
            </Typography>
            <RecoveryProvider>
                <div className={classes.tabContainer}>
                    <TabContext value={currentTab}>
                        <div className={classes.tabList}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Recovery Methods">
                                <Tab className={classes.tab} label="Mnemonic" value={tabs.mnemonic} />
                                <Tab className={classes.tab} label="Private Key" value={tabs.privateKey} />
                                <Tab className={classes.tab} label="KeyStore" value={tabs.local} />
                            </MaskTabList>
                        </div>
                        <div className={classes.panelContainer}>
                            <TabPanel value={tabs.mnemonic} classes={tabPanelClasses}>
                                <RestoreFromMnemonic
                                    handleRestoreFromMnemonic={handleRestoreFromMnemonic}
                                    error={error}
                                    setError={setError}
                                />
                            </TabPanel>
                            <TabPanel value={tabs.privateKey} classes={tabPanelClasses}>
                                <RestoreFromPrivateKey
                                    handleRestoreFromPrivateKey={handleRestoreFromPrivateKey}
                                    multiline
                                />
                            </TabPanel>
                            <TabPanel value={tabs.local} classes={tabPanelClasses}>
                                <RestoreWalletFromLocal
                                    handleRestoreFromLocalStore={handleRestoreFromLocalStore}
                                    setError={setError}
                                    error={error}
                                />
                            </TabPanel>
                        </div>
                    </TabContext>
                </div>
                <RecoveryContext.Consumer>
                    {({ SubmitOutlet }) => {
                        return (
                            <SetupFrameController>
                                <div className={classes.buttonGroup}>{SubmitOutlet}</div>
                            </SetupFrameController>
                        )
                    }}
                </RecoveryContext.Consumer>
            </RecoveryProvider>
        </Box>
    )
})

export default Recovery
