import { memo, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginServices } from '../../../../API'
import urlcat from 'urlcat'
import { MaskTextField } from '../../../../../../theme/src'
import PasswordField from '../../../../components/PasswordField'

const useStyles = makeStyles()({
    container: {
        padding: '120px 18%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
        fontWeight: 500,
    },
    form: {
        marginTop: 70,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: MaskColorVar.blue,
    },
    input: {
        width: '100%',
        marginTop: 10,
    },
    tips: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#7B8192',
        marginTop: 10,
    },
    controller: {
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 33%)',
        justifyContent: 'center',
        gridColumnGap: 10,
        padding: '27px 0',
    },
    button: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
    },
    alert: {
        marginTop: 24,
        padding: 24,
    },
})

const CreateWalletForm = memo(() => {
    const t = useDashboardI18N()
    const [open, setOpen] = useState(true)
    const { classes } = useStyles()
    const navigate = useNavigate()

    const { value: hasPassword, loading, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    useEffect(() => {
        WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    const schema = useMemo(() => {
        const passwordRule = zod
            .string()
            .min(8, t.create_wallet_password_length_error())
            .max(20, t.create_wallet_password_length_error())
            .refine(
                (input) => [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((regex) => regex.test(input)).length >= 2,
                t.create_wallet_password_match_tip(),
            )
        const confirmRule = zod.string().min(8).max(20)
        return zod
            .object({
                name: zod.string().min(1).max(12),
                password: hasPassword ? passwordRule.optional() : passwordRule,
                confirm: hasPassword ? confirmRule.optional() : confirmRule,
            })
            .refine((data) => (!hasPassword ? data.password === data.confirm : null), {
                message: t.create_wallet_password_match_tip(),
                path: ['confirm'],
            })
    }, [hasPassword])

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

    const onSubmit = handleSubmit((data) => {
        navigate(urlcat(RoutePaths.CreateMaskWalletMnemonic, { name: data.name }), {
            state: { password: data.password },
        })
    })

    return (
        <div className={classes.container}>
            <Typography className={classes.title}>{t.create_wallet_form_title()}</Typography>
            <form className={classes.form} onSubmit={onSubmit}>
                <Box>
                    <Typography className={classes.label}>{t.create_wallet_wallet_name()}</Typography>
                    <Controller
                        render={({ field }) => (
                            <MaskTextField
                                {...field}
                                className={classes.input}
                                error={!!errors.name?.message}
                                helperText={errors.name?.message}
                                placeholder={t.create_wallet_name_placeholder()}
                                InputProps={{ disableUnderline: true }}
                            />
                        )}
                        control={control}
                        name="name"
                    />
                </Box>
                {!loading && !hasPassword ? (
                    <>
                        <Box style={{ marginTop: 24 }}>
                            <Typography className={classes.label}>{t.create_wallet_payment_password()}</Typography>
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        className={classes.input}
                                        placeholder={t.create_wallet_payment_password()}
                                        error={!isValid && !!errors.password?.message}
                                        helperText={!isValid ? errors.password?.message : ''}
                                    />
                                )}
                                name="password"
                            />
                            <Controller
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        className={classes.input}
                                        error={!isValid && !!errors.confirm?.message}
                                        helperText={!isValid ? errors.confirm?.message : ''}
                                        placeholder={t.create_wallet_re_enter_payment_password()}
                                    />
                                )}
                                name="confirm"
                                control={control}
                            />
                        </Box>
                        <Typography className={classes.tips}>{t.create_wallet_payment_password_tip()}</Typography>
                    </>
                ) : null}
                <Box className={classes.controller}>
                    <Button color="secondary" className={classes.button} onClick={() => navigate(-1)}>
                        {t.cancel()}
                    </Button>
                    <Button className={classes.button} onClick={onSubmit} disabled={!isValid}>
                        {t.next()}
                    </Button>
                </Box>
                {open ? (
                    <Alert severity="error" onClose={() => setOpen(false)} className={classes.alert}>
                        {t.create_wallet_mnemonic_tip()}
                    </Alert>
                ) : null}
            </form>
        </div>
    )
})

export default CreateWalletForm
