import { memo, useMemo, useState } from 'react'
import { makeStyles, Tab, Tabs, TextField, Typography } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { useI18N } from '../../../../../utils'
import { getEnumAsArray } from '@dimensiondev/kit'
import { LoadingButton, TabContext, TabPanel } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import { DialogRoutes } from '../../../index'
import { JsonFileBox } from '../components/JsonFileBox'
import { StyledInput } from '../../../components/StyledInput'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useAsyncFn } from 'react-use'
import { useSnackbar } from '@masknet/theme'
const useStyles = makeStyles((theme) => ({
    container: {
        padding: '16px 10px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        color: '#151818',
        lineHeight: 1.5,
        fontWeight: 500,
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
        backgroundColor: '#F7F9FA',
    },
    textArea: {
        padding: 0,
        fontSize: 12,
    },
    button: {
        marginTop: 20,
        padding: '9px 10px',
        borderRadius: 20,
    },
}))

enum ImportWalletTab {
    Mnemonic = 'Mnemonic',
    JsonFile = 'Json File',
    PrivateKey = 'Private Key',
}

const ImportWallet = memo(() => {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    const history = useHistory()
    const classes = useStyles()
    const [currentTab, setCurrentTab] = useState(ImportWalletTab.Mnemonic)
    const [mnemonic, setMnemonic] = useState('')
    const [keyStoreContent, setKeyStoreContent] = useState('')
    const [keyStorePassword, setKeyStorePassword] = useState('')
    const [privateKey, setPrivateKey] = useState('')

    const schema = useMemo(() => {
        return zod
            .object({
                name: zod.string().min(1).max(12),
                password: zod
                    .string()
                    .min(8)
                    .max(20)
                    .refine((input) => /[A-Z]/.test(input), 'Must contain an uppercase character')
                    .refine((input) => /[a-z]/.test(input), 'Must contain a lowercase character')
                    .refine((input) => /\d/.test(input), 'Must contain a number')
                    .refine((input) => /[^\dA-Za-z]/.test(input), 'Must contain a special character'),
                confirm: zod.string().min(8).max(20),
            })
            .refine((data) => data.password === data.confirm, {
                message: "Passwords don't match",
                path: ['confirm'],
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
            password: '',
            confirm: '',
        },
    })

    const [{ loading }, onDerivedWallet] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            switch (currentTab) {
                case ImportWalletTab.Mnemonic:
                    const params = new URLSearchParams()
                    params.set('mnemonic', mnemonic)
                    history.replace({
                        pathname: DialogRoutes.AddDeriveWallet,
                        search: `?${params.toString()}`,
                    })
                    break
                case ImportWalletTab.JsonFile:
                    const { address, privateKey: _private_key_ } = await WalletRPC.fromKeyStore(
                        keyStoreContent,
                        Buffer.from(keyStorePassword, 'utf-8'),
                    )
                    await WalletRPC.importNewWallet({
                        name: data.name,
                        address,
                        _private_key_,
                    })
                    history.goBack()
                    break
                case ImportWalletTab.PrivateKey:
                    const { address: walletAddress, privateKeyValid } = await WalletRPC.recoverWalletFromPrivateKey(
                        privateKey,
                    )
                    if (!privateKeyValid) enqueueSnackbar('Import Failed', { variant: 'error' })
                    await WalletRPC.importNewWallet({
                        name: data.name,
                        address: walletAddress,
                        _private_key_: privateKey,
                    })
                    history.goBack()
                    break
                default:
                    break
            }
        },
        [mnemonic, currentTab, keyStoreContent, keyStorePassword, privateKey],
    )

    const onSubmit = handleSubmit(onDerivedWallet)

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

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <Typography className={classes.title}>Import the wallet</Typography>
                <NetworkSelector />
            </div>
            <form className={classes.form}>
                <div>
                    <Typography className={classes.label}>Wallet name</Typography>
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                classes={{ root: classes.textField }}
                                error={!!errors.name?.message}
                                helperText={errors.name?.message}
                                variant="filled"
                                placeholder="Enter 1-12 characters"
                            />
                        )}
                        control={control}
                        name="name"
                    />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Typography className={classes.label}>Payment Password</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                classes={{ root: classes.textField }}
                                type="password"
                                variant="filled"
                                placeholder="Payment Password"
                                error={!!errors.password?.message}
                                helperText={errors.password?.message}
                            />
                        )}
                        name="password"
                    />
                    <Controller
                        render={({ field }) => (
                            <StyledInput
                                classes={{ root: classes.textField }}
                                {...field}
                                error={!!errors.confirm?.message}
                                helperText={errors.confirm?.message}
                                type="password"
                                variant="filled"
                                placeholder="Re-enter the payment password"
                            />
                        )}
                        name="confirm"
                        control={control}
                    />
                </div>
                <Typography className={classes.tips}>
                    Payment Password must be a combination of 2 categories out of numbers, letters and special
                    characters with a length of 8-20 characters.
                </Typography>
            </form>
            <TabContext value={currentTab}>
                <Tabs
                    value={currentTab}
                    variant="fullWidth"
                    className={classes.tabs}
                    classes={{ indicator: classes.indicator }}
                    onChange={(event, tab) => setCurrentTab(tab)}>
                    {getEnumAsArray(ImportWalletTab).map(({ key, value }) => (
                        <Tab label={key} value={value} classes={{ root: classes.tab, selected: classes.selected }} />
                    ))}
                </Tabs>
                <TabPanel value={ImportWalletTab.Mnemonic} className={classes.tabPanel}>
                    <TextField
                        variant="filled"
                        multiline
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        rows={4}
                        placeholder="Please enter 12 mnemonic words separated by spaces"
                        InputProps={{ disableUnderline: true, classes: { root: classes.multilineInput } }}
                        className={classes.multiline}
                        inputProps={{ className: classes.textArea }}
                    />
                </TabPanel>
                <TabPanel value={ImportWalletTab.JsonFile} className={classes.tabPanel}>
                    <JsonFileBox onChange={(content: string) => setKeyStoreContent(content)} />
                    <StyledInput
                        type="password"
                        classes={{ root: classes.textField }}
                        placeholder="Original Password"
                        onChange={(e) => setKeyStorePassword(e.target.value)}
                        value={keyStorePassword}
                    />
                </TabPanel>
                <TabPanel value={ImportWalletTab.PrivateKey} className={classes.tabPanel}>
                    <TextField
                        variant="filled"
                        multiline
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        rows={4}
                        placeholder="Private Key"
                        InputProps={{ disableUnderline: true, classes: { root: classes.multilineInput } }}
                        className={classes.multiline}
                        inputProps={{ className: classes.textArea }}
                    />
                </TabPanel>
            </TabContext>
            <LoadingButton
                loading={loading}
                variant="contained"
                fullWidth
                className={classes.button}
                disabled={disabled}
                onClick={onSubmit}>
                Import
            </LoadingButton>
        </div>
    )
})

export default ImportWallet
