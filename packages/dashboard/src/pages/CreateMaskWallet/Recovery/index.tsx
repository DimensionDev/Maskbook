import { memo, useCallback, useMemo, useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { generateNewWalletName } from '@masknet/web3-shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { RestoreFromPrivateKey, type FormInputs } from '../../../components/Restore/RestoreFromPrivateKey.js'
import { RecoveryContext, RecoveryProvider } from '../../../contexts/index.js'
import { RestoreFromMnemonic } from '../../../components/Restore/RestoreFromMnemonic.js'
import { RestoreWalletFromLocal } from '../../../components/Restore/RestoreWalletFromLocal.js'
import { ResetWalletContext } from '../context.js'
import { useAsync } from 'react-use'
import { useWallets } from '@masknet/web3-hooks-base'

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
    const t = useDashboardI18N()
    const location = useLocation()
    const { cx, classes } = useStyles()
    const tabPanelClasses = useMemo(() => ({ root: classes.panels }), [classes.panels])
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()

    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local')

    const onTabChange = useCallback((event: object, value: string) => {
        onChange(event, value)
        setError('')
    }, [])

    const wallets = useWallets()

    const newWalletName = generateNewWalletName(wallets)

    const handleRestoreFromMnemonic = useCallback(
        async (values: string[]) => {
            try {
                const mnemonic = values.join(' ')
                await WalletServiceRef.value.getDerivableAccounts(mnemonic, 0, 1)

                navigate(DashboardRoutes.AddDeriveWallet, {
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
        [t, navigate, location.state?.isReset, location.state?.password],
    )

    const handleRestoreFromPrivateKey = useCallback(
        async (data: FormInputs, onError: UseFormSetError<FormInputs>) => {
            try {
                await handlePasswordAndWallets(location.state?.password, location.state?.isReset)
                await WalletServiceRef.value.recoverWalletFromPrivateKey(newWalletName, data.privateKey)
                navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                onError('privateKey', {
                    type: 'value',
                    message: errorMsg === 'Invalid private key.' ? t.sign_in_account_private_key_error() : errorMsg,
                })
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName],
    )

    const onRestore = useCallback(
        async (keyStoreContent: string, keyStorePassword: string) => {
            try {
                await handlePasswordAndWallets(location.state?.password, location.state?.isReset)

                const address = await WalletServiceRef.value.recoverWalletFromKeyStoreJSON(
                    newWalletName,
                    keyStoreContent,
                    keyStorePassword,
                )
                await WalletServiceRef.value.resolveMaskAccount([{ address }])
                navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
            } catch (error) {
                const errorMsg = (error as Error).message
                // Todo: SDK should return 'Incorrect Keystore Password.' when keystore pwd is wrong.
                setError(
                    errorMsg === 'Incorrect payment password.'
                        ? t.create_wallet_key_store_incorrect_password()
                        : errorMsg,
                )
            }
        },
        [t, navigate, location.state?.isReset, location.state?.password, newWalletName],
    )

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.CreateMaskWalletMnemonic, {
            state: {
                password: location.state?.password,
                isReset: location.state?.isReset,
            },
            replace: true,
        })
    }, [location.state?.password, location.state?.isReset])

    const { value: hasPassword, loading: loadingHasPassword } = useAsync(WalletServiceRef.value.hasPassword, [])

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
