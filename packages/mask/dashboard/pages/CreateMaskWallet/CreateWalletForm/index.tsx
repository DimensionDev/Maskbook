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
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
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
            .min(6, _(msg`Payment password must be 6 to 20 characters.`))
            .max(20, _(msg`Payment password must be 6 to 20 characters.`))

        return zod
            .object({
                password: passwordRule,
                confirm: zod.string().optional(),
            })
            .refine((data) => data.password === data.confirm, {
                message: _(msg`Entered passwords are inconsistent.`),
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
                {!isReset ?
                    <Trans>Step 1/3</Trans>
                :   null}
            </Typography>
            <Typography className={cx(classes.title, classes.bold)}>
                <Trans>Set Your Payment Password</Trans>
            </Typography>
            <Typography className={classes.tips}>
                <Trans>Payment Password should be between 6 and 20 characters.</Trans>
            </Typography>
            <form className={classes.form} onSubmit={onSubmit}>
                <Box style={{ marginTop: 24, display: 'flex', flexDirection: 'column', rowGap: 10 }}>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <PasswordField
                                {...field}
                                autoFocus
                                className={classes.input}
                                placeholder={_(msg`At least 6 characters`)}
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
                                placeholder={_(msg`Confirm Payment Password`)}
                            />
                        )}
                        name="confirm"
                        control={control}
                    />
                </Box>

                <Typography className={classes.tipsBottom}>
                    <Trans>
                        Your payment password encrypts wallet data and is needed to unlocking the wallet, transaction
                        confirmations and signing. The password is never stored, and there is no way to recover it if
                        you forget it.
                    </Trans>
                </Typography>
            </form>
            <SetupFrameController>
                <PrimaryButton
                    width="125px"
                    size="large"
                    color="primary"
                    className={classes.bold}
                    onClick={onSubmit}
                    disabled={!isValid}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </SetupFrameController>
        </div>
    )
})
