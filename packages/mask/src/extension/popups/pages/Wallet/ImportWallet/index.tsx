import { memo, useMemo, useState } from 'react'
import { Tab, Tabs, Typography } from '@mui/material'
import { makeStyles, useTabs } from '@masknet/theme'
import { Controller, useForm } from 'react-hook-form'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton, TabContext, TabPanel } from '@mui/lab'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { JsonFileBox } from '../components/JsonFileBox'
import { StyledInput } from '../../../components/StyledInput'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useAsyncFn } from 'react-use'
import { query } from 'urlcat'
import { useI18N } from '../../../../../utils'
import Services from '../../../../service'
import { getDerivableAccounts } from '../../../../../plugins/Wallet/services'
import { PageHeader } from '../components/PageHeader'
import { PasswordField } from '../../../components/PasswordField'
import { currentMaskWalletAccountSettings } from '../../../../../plugins/Wallet/settings'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px',
    },
    textField: {
        marginTop: 10,
    },
    form: {
        marginTop: 26,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    tips: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginTop: 10,
    },
    tabs: {
        marginTop: 20,
        minHeight: 'unset',
    },
    tab: {
        fontSize: 12,
        lineHeight: '16px',
        padding: 9,
        minWidth: 0,
        backgroundColor: '#F7F9FA',
        minHeight: 'unset',
    },
    indicator: {
        display: 'none',
    },
    selected: {
        backgroundColor: '#ffffff',
    },
    tabPanel: {
        padding: '16px 0 0 0',
        flex: 1,
        position: 'relative',
    },
    multiline: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    multilineInput: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#F7F9FA',
        height: '100%',
    },
    textArea: {
        padding: 0,
        fontSize: 12,
        height: '100%!important',
    },
    button: {
        fontWeight: 600,
        padding: '9px 10px',
        borderRadius: 20,
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        marginTop: 24,
        lineHeight: '16px',
        wordBreak: 'break-all',
    },
    controller: {
        padding: '20px 10px',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

const ImportWallet = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { classes } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'json', 'privateKey')
    const [mnemonic, setMnemonic] = useState('')
    const [keyStoreContent, setKeyStoreContent] = useState('')
    const [keyStorePassword, setKeyStorePassword] = useState('')
    const [privateKey, setPrivateKey] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const schema = useMemo(() => {
        return zod.object({
            name: zod.string().min(1).max(12),
        })
    }, [])

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
        },
    })

    const disabled = useMemo(() => {
        if (!isValid) return true
        switch (currentTab) {
            case tabs.mnemonic:
                return !mnemonic
            case tabs.json:
                return !keyStoreContent
            case tabs.privateKey:
                return !privateKey
            default:
                return true
        }
    }, [currentTab, mnemonic, keyStorePassword, keyStoreContent, privateKey, isValid, tabs])

    const [{ loading }, onDerivedWallet] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (!disabled) {
                try {
                    switch (currentTab) {
                        case tabs.mnemonic:
                            // valid the mnemonic
                            await getDerivableAccounts(mnemonic, 0, 1)
                            const params = query({ name: data.name })
                            navigate(PopupRoutes.AddDeriveWallet + '?' + params, {
                                replace: true,
                                state: { mnemonic },
                            })
                            break
                        case tabs.json:
                            const wallet = await WalletRPC.recoverWalletFromKeyStoreJSON(
                                data.name,
                                keyStoreContent,
                                keyStorePassword,
                            )
                            if (!currentMaskWalletAccountSettings.value) {
                                await WalletRPC.updateMaskAccount({
                                    account: wallet,
                                })
                            }
                            await WalletRPC.resolveMaskAccount([wallet])
                            navigate(PopupRoutes.Wallet, { replace: true })
                            await Services.Helper.removePopupWindow()
                            break
                        case tabs.privateKey:
                            const privateKeyWallet = await WalletRPC.recoverWalletFromPrivateKey(data.name, privateKey)
                            await WalletRPC.updateMaskAccount({
                                account: privateKeyWallet,
                            })
                            await WalletRPC.resolveMaskAccount([privateKeyWallet])

                            await connection?.connect({
                                account: privateKeyWallet,
                                providerType: ProviderType.MaskWallet,
                                popupsWindow: false,
                            })

                            await Services.Helper.removePopupWindow()
                            navigate(PopupRoutes.Wallet, { replace: true })
                            break
                        default:
                            break
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        setErrorMessage(error.message)
                    }
                }
            }
        },
        [mnemonic, currentTab, keyStoreContent, keyStorePassword, privateKey, disabled, history, tabs],
    )

    const onSubmit = handleSubmit(onDerivedWallet)

    useTitle(t('popups_import_the_wallet'))

    return (
        <>
            <div className={classes.container}>
                <PageHeader title={t('plugin_wallet_import_wallet')} />
                <form className={classes.form} onSubmit={onSubmit}>
                    <div>
                        <Typography className={classes.label}>{t('wallet_name')}</Typography>
                        <Controller
                            render={({ field }) => (
                                <StyledInput
                                    {...field}
                                    classes={{ root: classes.textField }}
                                    error={!!errors.name?.message}
                                    helperText={errors.name?.message}
                                    variant="filled"
                                    placeholder={t('popups_wallet_name_placeholder')}
                                />
                            )}
                            control={control}
                            name="name"
                        />
                    </div>
                </form>
                <TabContext value={currentTab}>
                    <Tabs
                        value={currentTab}
                        variant="fullWidth"
                        className={classes.tabs}
                        classes={{ indicator: classes.indicator }}
                        onChange={(event, tab) => {
                            if (errorMessage) setErrorMessage('')
                            onChange(event, tab)
                        }}>
                        <Tab
                            label={t('popups_wallet_name_mnemonic')}
                            value={tabs.mnemonic}
                            classes={{ root: classes.tab, selected: classes.selected }}
                        />
                        <Tab
                            label={t('popups_wallet_name_json_file')}
                            value={tabs.json}
                            classes={{ root: classes.tab, selected: classes.selected }}
                        />
                        <Tab
                            label={t('popups_wallet_name_private_key')}
                            value={tabs.privateKey}
                            classes={{ root: classes.tab, selected: classes.selected }}
                        />
                    </Tabs>
                    <TabPanel value={tabs.mnemonic} className={classes.tabPanel}>
                        <StyledInput
                            type="password"
                            value={mnemonic}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setMnemonic(e.target.value.replaceAll('\n', ' '))
                            }}
                            placeholder={t('popups_wallet_name_mnemonic_placeholder')}
                            InputProps={{ disableUnderline: true }}
                            className={classes.textField}
                        />
                    </TabPanel>
                    <TabPanel value={tabs.json} className={classes.tabPanel}>
                        <JsonFileBox onChange={(content: string) => setKeyStoreContent(content)} />
                        <PasswordField
                            classes={{ root: classes.textField }}
                            placeholder={t('popups_wallet_name_origin_password')}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setKeyStorePassword(e.target.value)
                            }}
                            value={keyStorePassword}
                        />
                    </TabPanel>
                    <TabPanel value={tabs.privateKey} className={classes.tabPanel}>
                        <StyledInput
                            type="password"
                            value={privateKey}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setPrivateKey(e.target.value)
                            }}
                            rows={4}
                            placeholder={t('popups_wallet_name_private_key')}
                            InputProps={{ disableUnderline: true }}
                            className={classes.textField}
                        />
                    </TabPanel>
                </TabContext>
                <Typography className={classes.error}>{errorMessage}</Typography>
            </div>
            <div className={classes.controller}>
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    fullWidth
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    disabled={disabled}
                    onClick={onSubmit}>
                    {t('import')}
                </LoadingButton>
            </div>
        </>
    )
})

export default ImportWallet
