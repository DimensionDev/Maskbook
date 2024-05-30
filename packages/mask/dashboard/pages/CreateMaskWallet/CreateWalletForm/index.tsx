import { memo, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardTrans } from '../../../locales/index.js'
import PasswordField from '../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
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
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    tipsBottom: {
        fontSize: 14,
        lineHeight: '18px',
        marginTop: 8,
        marginBottom: 24,
        color: theme.palette.maskColor.main,
    },

    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    bold: {
        fontWeight: 700,
    },
}))

export const Component = memo(function CreateWalletForm() {
    const t = useDashboardTrans()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const isReset = params.get('reset')
    const isRecover = params.get('recover')

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
    }, [t])

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
            urlcat(isRecover ? DashboardRoutes.RecoveryMaskWallet : DashboardRoutes.CreateMaskWalletMnemonic, {}),
            data.password ?
                {
                    state: { password: data.password, isReset },
                }
            :   undefined,
        )
    })

    return (
        <div className={classes.container}>
            <Typography className={cx(classes.second, classes.bold)}>
                {!isReset ? t.create_step({ step: '1', totalSteps: '3' }) : null}
            </Typography>
            <Typography className={cx(classes.title, classes.bold)}>{t.set_payment_password()}</Typography>
            <Typography className={classes.tips}>{t.create_wallet_payment_password_tip_1()}</Typography>
            <form className={classes.form} onSubmit={onSubmit}>
                <Box style={{ marginTop: 24, display: 'flex', flexDirection: 'column', rowGap: 10 }}>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <PasswordField
                                {...field}
                                autoFocus
                                className={classes.input}
                                placeholder={t.create_wallet_payment_password_place_holder()}
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

                <Typography className={classes.tipsBottom}>{t.create_wallet_payment_password_tip_2()}</Typography>
            </form>
            <SetupFrameController>
                <PrimaryButton
                    width="125px"
                    size="large"
                    color="primary"
                    className={classes.bold}
                    onClick={onSubmit}
                    disabled={!isValid}>
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </div>
    )
})
