import { memo, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, formHelperTextClasses, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RoutePaths } from '../../../../type'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginServices } from '../../../../API'
import urlcat from 'urlcat'
import { MaskTextField } from '@masknet/theme'
import PasswordField from '../../../../components/PasswordField'
import { InfoIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
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
        color: MaskColorVar.main,
    },
    input: {
        width: '100%',
        marginTop: 10,
    },
    textField: {
        background: theme.palette.mode === 'dark' ? '#1D2023' : '#F7F9FA',
        padding: theme.spacing(1),
        fontSize: 12,
        lineHeight: '16px',
        borderRadius: 6,
        [`&.${formHelperTextClasses.error}`]: {
            boxShadow: `0 0 0 ${theme.spacing(0.5)} ${MaskColorVar.redMain.alpha(0.2)}`,
            border: `1px solid ${MaskColorVar.redMain.alpha(0.8)}`,
        },
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
    cancelButton: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
        background: theme.palette.mode === 'dark' ? '#1A1D20' : '#F7F9FA',
    },
    alert: {
        marginTop: 24,
        padding: 24,
        backgroundColor: MaskColorVar.errorBackground,
        color: MaskColorVar.redMain,
    },
}))

const CreateWalletForm = memo(() => {
    const t = useDashboardI18N()
    const [open, setOpen] = useState(true)
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { value: hasPassword, loading, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    useEffect(() => {
        return WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    const schema = useMemo(() => {
        const passwordRule = zod
            .string()
            .min(8, t.create_wallet_password_length_error())
            .max(20, t.create_wallet_password_length_error())
            .refine(
                (input) => [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((regex) => regex.test(input)).length >= 2,
                t.create_wallet_password_satisfied_requirement(),
            )

        return zod
            .object(
                hasPassword
                    ? { name: zod.string().min(1).max(12) }
                    : {
                          name: zod.string().min(1).max(12),
                          password: hasPassword ? passwordRule.optional() : passwordRule,
                          confirm: zod.string().optional(),
                      },
            )
            .refine((data) => (!hasPassword ? data.password === data.confirm : true), {
                message: t.create_wallet_password_match_tip(),
                path: ['confirm'],
            })
    }, [hasPassword])

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onBlur',
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            password: '',
            confirm: '',
        },
    })

    const onSubmit = handleSubmit((data) => {
        navigate(
            urlcat(RoutePaths.CreateMaskWalletMnemonic, { name: data.name, chainId: searchParams.get('chainId') }),
            data.password
                ? {
                      state: { password: data.password },
                  }
                : undefined,
        )
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
                                inputProps={{ autoComplete: 'off' }}
                                InputProps={{ className: classes.textField }}
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
                                        InputProps={{ className: classes.textField }}
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
                                        InputProps={{ className: classes.textField }}
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
                    <Button color="secondary" className={classes.cancelButton} onClick={() => navigate(-1)}>
                        {t.cancel()}
                    </Button>
                    <Button className={classes.button} onClick={onSubmit} disabled={!isValid}>
                        {t.next()}
                    </Button>
                </Box>
                {open ? (
                    <Alert
                        icon={<InfoIcon />}
                        severity="error"
                        onClose={() => setOpen(false)}
                        className={classes.alert}>
                        {t.create_wallet_mnemonic_tip()}
                    </Alert>
                ) : null}
            </form>
        </div>
    )
})

export default CreateWalletForm
