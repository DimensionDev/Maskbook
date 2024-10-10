import { DashboardRoutes, NetworkPluginID } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { generateNewWalletName } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        color: theme.palette.maskColor.second,
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

export const Component = memo(function Recovery() {
    const { _ } = useLingui()
    const t = useDashboardTrans()
    const location = useLocation()
    const { cx, classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()
    const [error, setError] = useState<ReactNode>()
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()

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

                navigate(urlcat(DashboardRoutes.AddDeriveWallet, {}), {
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
                setError(errorMsg === 'Invalid mnemonic words.' ? <Trans>Incorrect Mnemonic Words.</Trans> : errorMsg)
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password],
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
                navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, {}), { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                onError('privateKey', {
                    type: 'value',
                    message: errorMsg === 'Invalid private key.' ? _(msg`Incorrect Private Key`) : errorMsg,
                })
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName],
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
                navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, {}), { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                // Todo: SDK should return 'Incorrect Keystore Password.' when keystore pwd is wrong.
                setError(
                    errorMsg === 'Incorrect payment password.' ? <Trans>Incorrect Keystore Password.</Trans> : errorMsg,
                )
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName],
    )

    const handleRecovery = useCallback(() => {
        navigate(urlcat(DashboardRoutes.CreateMaskWalletMnemonic, {}), {
            state: {
                password: location.state?.password,
                isReset: location.state?.isReset,
            },
            replace: true,
        })
    }, [location.state?.password, location.state?.isReset])

    const { value: hasPassword, loading: loadingHasPassword } = useAsync(Services.Wallet.hasPassword, [])

    const step = hasPassword ? '1' : '2'

    return (
        <>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    {loadingHasPassword ?
                        ''
                    :   <Trans>
                            Step {step}/{step}
                        </Trans>
                    }
                </Typography>
                <Typography className={cx(classes.create, classes.bold)} onClick={handleRecovery}>
                    <Trans>Create</Trans>
                </Typography>
            </div>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Recover your wallet</Trans>
                </Typography>
            </Box>

            <Typography className={classes.second} mt={2}>
                <Trans>
                    Please enter the correct mnemonic words, private key, or upload the correct keystore file.
                </Trans>
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
                <SetupFrameController>
                    <Outlet />
                </SetupFrameController>
            </RecoveryProvider>
        </>
    )
})

function Outlet() {
    const { classes } = useStyles()
    return <div className={classes.buttonGroup}>{use(RecoveryContext).SubmitOutlet}</div>
}
