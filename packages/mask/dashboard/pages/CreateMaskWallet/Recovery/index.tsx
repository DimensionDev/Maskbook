import { DashboardRoutes, NetworkPluginID } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { generateNewWalletName } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useMemo, useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAsync } from 'react-use'
import { RestoreFromMnemonic } from '../../../components/Restore/RestoreFromMnemonic.js'
import { RestoreFromPrivateKey, type FormInputs } from '../../../components/Restore/RestoreFromPrivateKey.js'
import { RestoreWalletFromLocal } from '../../../components/Restore/RestoreWalletFromLocal.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { RecoveryContext, RecoveryProvider } from '../../../contexts/index.js'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { ResetWalletContext } from '../context.js'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import Services from '#services'
import urlcat from 'urlcat'

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
        borderRadius: theme.spacing(1),
        overflow: 'hidden',
    },
    tabList: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing('14px', 2, 0),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
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
    bold: {
        fontWeight: 700,
    },
    create: {
        fontSize: 14,
        cursor: 'pointer',
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
}))

const Recovery = memo(function Recovery() {
    const t = useDashboardTrans()
    const location = useLocation()
    const { cx, classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()
    const [params] = useSearchParams()
    const external_request = params.get('external_request')

    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local')

    const onTabChange = useCallback((event: object, value: string) => {
        onChange(event, value)
        setError('')
    }, [])

    const wallets = useWallets()

    const newWalletName = useMemo(() => generateNewWalletName(wallets), [wallets])

    const handleRestoreFromMnemonic = useCallback(
        async (values: string[]) => {
            try {
                const mnemonic = values.join(' ')
                await Services.Wallet.getDerivableAccounts(mnemonic, 0, 1)

                navigate(urlcat(DashboardRoutes.AddDeriveWallet, { external_request }), {
                    replace: false,
                    state: {
                        mnemonic,
                        password: location.state?.password,
                        isReset: location.state?.isReset,
                    },
                })
            } catch (error) {
                const errorMsg = (error as Error).message
                // SDK's error message is not as same as design.
                setError(
                    errorMsg === 'Invalid mnemonic words.' ? t.wallet_recovery_mnemonic_confirm_failed() : errorMsg,
                )
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, external_request],
    )

    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const handleRestoreFromPrivateKey = useCallback(
        async (data: FormInputs, onError: UseFormSetError<FormInputs>) => {
            try {
                const result = await handlePasswordAndWallets(location.state?.password, location.state?.isReset)
                if (!result) return
                const address = await Services.Wallet.generateAddressFromPrivateKey(data.privateKey)
                const ens = await NameService?.reverse?.(address)
                const walletName = ens || newWalletName
                const account = await Services.Wallet.recoverWalletFromPrivateKey(walletName, data.privateKey)
                await EVMWeb3.connect({
                    account,
                    providerType: ProviderType.MaskWallet,
                    silent: true,
                })
                Telemetry.captureEvent(EventType.Access, EventID.EntryPopupWalletImport)
                navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, { external_request }), { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                onError('privateKey', {
                    type: 'value',
                    message: errorMsg === 'Invalid private key.' ? t.sign_in_account_private_key_error() : errorMsg,
                })
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName, external_request],
    )

    const onRestore = useCallback(
        async (keyStoreContent: string, keyStorePassword: string) => {
            try {
                const result = await handlePasswordAndWallets(location.state?.password, location.state?.isReset)
                if (!result) return
                const jsonAddress = await Services.Wallet.generateAddressFromKeyStoreJSON(
                    keyStoreContent,
                    keyStorePassword,
                )
                const ens = await NameService?.reverse?.(jsonAddress)
                const walletName = ens || newWalletName

                const address = await Services.Wallet.recoverWalletFromKeyStoreJSON(
                    walletName,
                    keyStoreContent,
                    keyStorePassword,
                )
                await EVMWeb3.connect({
                    account: address,
                    providerType: ProviderType.MaskWallet,
                    silent: true,
                })
                await Services.Wallet.resolveMaskAccount([{ address }])
                Telemetry.captureEvent(EventType.Access, EventID.EntryPopupWalletImport)
                navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, { external_request }), { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                // Todo: SDK should return 'Incorrect Keystore Password.' when keystore pwd is wrong.
                setError(
                    errorMsg === 'Incorrect payment password.' ?
                        t.create_wallet_key_store_incorrect_password()
                    :   errorMsg,
                )
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName, external_request],
    )

    const handleRecovery = useCallback(() => {
        navigate(urlcat(DashboardRoutes.CreateMaskWalletMnemonic, { external_request }), {
            state: {
                password: location.state?.password,
                isReset: location.state?.isReset,
            },
            replace: true,
        })
    }, [location.state?.password, location.state?.isReset, external_request])

    const { value: hasPassword, loading: loadingHasPassword } = useAsync(Services.Wallet.hasPassword, [])

    const step = hasPassword ? '1' : '2'

    return (
        <>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    {loadingHasPassword ? '' : t.create_step({ step, totalSteps: step })}
                </Typography>
                <Typography className={cx(classes.create, classes.bold)} onClick={handleRecovery}>
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
                            <MaskTabList variant="base" onChange={onTabChange} aria-label="Recovery Methods">
                                <Tab className={classes.tab} label="Mnemonic" value={tabs.mnemonic} />
                                <Tab className={classes.tab} label="Private Key" value={tabs.privateKey} />
                                <Tab className={classes.tab} label="Keystore" value={tabs.local} />
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
                                <RestoreWalletFromLocal onRestore={onRestore} setError={setError} error={error} />
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
        </>
    )
})

export default Recovery
