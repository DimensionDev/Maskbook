import { memo, useCallback, useMemo, useState } from 'react'
import { Button, makeStyles, Tab, Tabs, TextField, Typography } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NetworkSelector } from '../NetworkSelector'
import { useI18N } from '../../../../../../utils'
import { getEnumAsArray } from '@dimensiondev/kit'
import { TabContext, TabPanel } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import { DialogRoutes } from '../../../../index'

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
    form: {
        marginTop: 26,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    textField: {
        width: '100%',
        marginTop: 10,
    },
    textFieldInput: {
        backgroundColor: '#F7F9FA',
    },
    input: {
        padding: '11px 9px',
        fontSize: 12,
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

export const ImportWallet = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const classes = useStyles()
    const [currentTab, setCurrentTab] = useState(ImportWalletTab.Mnemonic)
    const [mnemonic, setMnemonic] = useState('')

    const schema = useMemo(() => {
        return zod
            .object({
                name: zod.string().min(1).max(12),
                password: zod
                    .string()
                    .min(8)
                    .max(20)
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return code >= String('A').charCodeAt(0) && code <= String('Z').charCodeAt(0)
                            }),
                        'Must contain an uppercase character',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return code >= String('a').charCodeAt(0) && code <= String('z').charCodeAt(0)
                            }),
                        'Must contain a lowercase character',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return code >= String('0').charCodeAt(0) && code <= String('9').charCodeAt(0)
                            }),
                        'Must contain a number',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return !(
                                    (code >= String('a').charCodeAt(0) && code <= String('z').charCodeAt(0)) ||
                                    (code >= String('A').charCodeAt(0) && code <= String('Z').charCodeAt(0)) ||
                                    (code >= String('0').charCodeAt(0) && code <= String('9').charCodeAt(0))
                                )
                            }),
                        'Must contain a special character',
                    ),
                confirm: zod.string().min(8).max(20),
            })
            .refine((data) => data.password === data.confirm, {
                message: "Passwords don't match",
                path: ['confirm'],
            })
    }, [])

    const {
        control,
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

    const onSubmit = useCallback(() => {
        switch (currentTab) {
            case ImportWalletTab.Mnemonic:
                const params = new URLSearchParams()
                params.set('mnemonic', mnemonic)
                history.push({
                    pathname: DialogRoutes.AddDeriveWallet,
                    search: `?${params.toString()}`,
                })
                break
            default:
                break
        }
    }, [mnemonic, currentTab])

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
                            <TextField
                                {...field}
                                error={!!errors.name?.message}
                                helperText={errors.name?.message}
                                variant="filled"
                                placeholder="Enter 1-12 characters"
                                className={classes.textField}
                                inputProps={{ className: classes.input }}
                                InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
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
                            <TextField
                                {...field}
                                type="password"
                                variant="filled"
                                placeholder="Payment Password"
                                error={!!errors.password?.message}
                                helperText={errors.password?.message}
                                className={classes.textField}
                                inputProps={{ className: classes.input }}
                                InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
                            />
                        )}
                        name="password"
                    />
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={!!errors.confirm?.message}
                                helperText={errors.confirm?.message}
                                type="password"
                                variant="filled"
                                placeholder="Re-enter the payment password"
                                className={classes.textField}
                                inputProps={{ className: classes.input }}
                                InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
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
            </TabContext>
            <Button
                variant="contained"
                fullWidth
                className={classes.button}
                disabled={!isValid || !mnemonic}
                onClick={onSubmit}>
                Import
            </Button>
        </div>
    )
})
