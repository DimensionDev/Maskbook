import { memo, useMemo, useState } from 'react'
import { Tab, Tabs, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useForm, Controller } from 'react-hook-form'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getEnumAsArray } from '@dimensiondev/kit'
import { LoadingButton, TabContext, TabPanel } from '@material-ui/lab'
import { useHistory, useLocation } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
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
    },
    multiline: {
        width: '100%',
    },
    multilineInput: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#F7F9FA',
    },
    textArea: {
        padding: 0,
        fontSize: 12,
    },
    button: {
        fontWeight: 600,
        padding: '9px 10px',
        borderRadius: 20,
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        marginTop: 8,
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

enum ImportWalletTab {
    Mnemonic = 'Mnemonic',
    JsonFile = 'Json File',
    PrivateKey = 'Private Key',
}

const ImportWallet = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const location = useLocation()
    const { classes } = useStyles()
    const [currentTab, setCurrentTab] = useState(ImportWalletTab.Mnemonic)
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
            case ImportWalletTab.Mnemonic:
                return !mnemonic
            case ImportWalletTab.JsonFile:
                return !keyStoreContent
            case ImportWalletTab.PrivateKey:
                return !privateKey
            default:
                return true
        }
    }, [currentTab, mnemonic, keyStorePassword, keyStoreContent, privateKey, isValid])

    const [{ loading }, onDerivedWallet] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (!disabled) {
                try {
                    switch (currentTab) {
                        case ImportWalletTab.Mnemonic:
                            // valid the mnemonic
                            await getDerivableAccounts(mnemonic, 0, 1)

                            const params = query({ mnemonic, name: data.name })
                            history.replace({
                                pathname: PopupRoutes.AddDeriveWallet,
                                search: `?${params}`,
                            })
                            break
                        case ImportWalletTab.JsonFile:
                            await WalletRPC.recoverWalletFromKeyStoreJSON(data.name, keyStoreContent, keyStorePassword)
                            history.replace(PopupRoutes.Wallet)
                            await Services.Helper.removePopupWindow()
                            break
                        case ImportWalletTab.PrivateKey:
                            await WalletRPC.recoverWalletFromPrivateKey(data.name, privateKey)
                            await Services.Helper.removePopupWindow()
                            history.replace(PopupRoutes.Wallet)
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
        [mnemonic, currentTab, keyStoreContent, keyStorePassword, privateKey, location.search, disabled],
    )

    const onSubmit = handleSubmit(onDerivedWallet)

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
                            setCurrentTab(tab)
                        }}>
                        {getEnumAsArray(ImportWalletTab).map(({ key, value }) => (
                            <Tab
                                key={key}
                                label={key}
                                value={value}
                                classes={{ root: classes.tab, selected: classes.selected }}
                            />
                        ))}
                    </Tabs>
                    <TabPanel value={ImportWalletTab.Mnemonic} className={classes.tabPanel}>
                        <TextField
                            variant="filled"
                            multiline
                            value={mnemonic}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setMnemonic(e.target.value)
                            }}
                            rows={4}
                            placeholder="Please enter 12 mnemonic words separated by spaces"
                            InputProps={{ disableUnderline: true, classes: { root: classes.multilineInput } }}
                            className={classes.multiline}
                            inputProps={{ className: classes.textArea }}
                        />
                    </TabPanel>
                    <TabPanel value={ImportWalletTab.JsonFile} className={classes.tabPanel}>
                        <JsonFileBox onChange={(content: string) => setKeyStoreContent(content)} />
                        <PasswordField
                            classes={{ root: classes.textField }}
                            placeholder="Original Password"
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setKeyStorePassword(e.target.value)
                            }}
                            value={keyStorePassword}
                        />
                    </TabPanel>
                    <TabPanel value={ImportWalletTab.PrivateKey} className={classes.tabPanel}>
                        <TextField
                            variant="filled"
                            multiline
                            value={privateKey}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage('')
                                setPrivateKey(e.target.value)
                            }}
                            rows={4}
                            placeholder="Private Key"
                            InputProps={{ disableUnderline: true, classes: { root: classes.multilineInput } }}
                            className={classes.multiline}
                            inputProps={{ className: classes.textArea }}
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
