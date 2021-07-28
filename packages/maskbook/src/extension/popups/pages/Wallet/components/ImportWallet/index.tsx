import { memo, useMemo } from 'react'
import { makeStyles, Tab, Tabs, TextField, Typography } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NetworkSelector } from '../NetworkSelector'

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
}))

export const ImportWallet = memo(() => {
    const classes = useStyles()

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
        handleSubmit,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            password: '',
            confirm: '',
        },
    })
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
                                InputProps={{ disableUnderline: true }}
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
                                InputProps={{ disableUnderline: true }}
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
                                InputProps={{ disableUnderline: true }}
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
            <Tabs value={0} variant="fullWidth" className={classes.tabs} classes={{ indicator: classes.indicator }}>
                <Tab label="Mnemonic" value={0} className={classes.tab} />
                <Tab label="Json File" value={1} className={classes.tab} />
                <Tab label="Private Key" value={2} className={classes.tab} />
            </Tabs>
        </div>
    )
})
