import { memo, useEffect, useMemo } from 'react'
import { Box, formHelperTextClasses, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SetupFrameController } from '../../../components/CreateWalletFrame/index.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../locales/index.js'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../../../API.js'
import PasswordField from '../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    title: {
        fontSize: 30,
        margin: '12px 0',
        lineHeight: '120%',
        color: theme.palette.maskColor.main,
    },
    form: {
        marginTop: 24,
        width: '90%',
        maxWidth: 720,
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
        fontSize: 14,
        lineHeight: '18px',
        fontFamily: 'Helvetica',
        color: theme.palette.maskColor.second,
    },
    tipsBottom: {
        fontSize: 14,
        lineHeight: '18px',
        fontFamily: 'Helvetica',
        marginTop: 8,
        marginBottom: 24,
        color: theme.palette.maskColor.main,
    },

    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    helveticaBold: {
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
}))

const CreateWalletForm = memo(() => {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { value: hasPassword, loading, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    useEffect(() => {
        if (hasPassword) navigate(DashboardRoutes.CreateMaskWalletMnemonic)
    }, [hasPassword])

    const schema = useMemo(() => {
        const passwordRule = zod
            .string()
            .min(6, t.create_wallet_password_length_error())
            .max(20, t.create_wallet_password_length_error())

        return zod
            .object({
                password: passwordRule,
                confirm: zod.string().optional(),
            })
            .refine((data) => data.password === data.confirm, {
                message: t.create_wallet_password_match_tip(),
                path: ['confirm'],
            })
    }, [])

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<{ password?: string; confirm?: string }>({
        mode: 'onBlur',
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
            confirm: '',
        },
    })

    const onSubmit = handleSubmit((data) => {
        navigate(
            DashboardRoutes.CreateMaskWalletMnemonic,
            data.password
                ? {
                      state: { password: data.password },
                  }
                : undefined,
        )
    })

    return (
        <div className={classes.container}>
            <Typography className={cx(classes.second, classes.helveticaBold)}>
                {t.create_step({ step: '1', total: '3' })}
            </Typography>
            <Typography className={cx(classes.title, classes.helveticaBold)}>{t.set_payment_password()}</Typography>
            <Typography className={classes.tips}>{t.create_wallet_payment_password_tip_1()}</Typography>
            <form className={classes.form} onSubmit={onSubmit}>
                {!loading ? (
                    <>
                        <Box style={{ marginTop: 24, display: 'flex', flexDirection: 'column', rowGap: 10 }}>
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        className={classes.input}
                                        placeholder={t.create_wallet_payment_password_place_holder()}
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
                    </>
                ) : null}
                <Typography className={classes.tipsBottom}>{t.create_wallet_payment_password_tip_2()}</Typography>
                <Typography className={classes.tipsBottom}>{t.create_wallet_payment_password_tip_3()}</Typography>
            </form>
            <SetupFrameController>
                <PrimaryButton
                    width="125px"
                    size="large"
                    color="primary"
                    className={classes.helveticaBold}
                    onClick={onSubmit}
                    disabled={!isValid}>
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </div>
    )
})

export default CreateWalletForm
