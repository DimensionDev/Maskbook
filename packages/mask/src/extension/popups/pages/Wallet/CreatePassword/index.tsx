import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { useI18N } from '../../../../../utils/index.js'
import { usePasswordForm } from '../hooks/usePasswordForm.js'
import type { z as zod } from 'zod'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { Controller } from 'react-hook-form'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { LoadingButton } from '@mui/lab'
import Services from '../../../../service.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'

const useStyles = makeStyles()((theme) => ({
    header: {
        height: 140,
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginTop: theme.spacing(4),
        fontSize: 24,
        lineHeight: 1.2,
        fontWeight: 700,
        textAlign: 'center',
        color: '#07101B',
    },
    tip: {
        marginTop: theme.spacing(1.5),
        color: '#ACB4C1',
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        textAlign: 'center',
    },
    form: {
        padding: theme.spacing(2.25, 2.25, 7.5, 2.25),
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
    },
    controller: {
        padding: 16,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
    },
    button: {
        fontWeight: 600,
        padding: '11px 10px',
        borderRadius: 8,
        backgroundColor: '#07101B',
        fontSize: 14,
        lineHeight: '18px',
    },
    disabled: {
        backgroundColor: `${theme.palette.maskColor.primaryMain}!important`,
        color: '#ffffff!important',
    },
}))

const CreatePassword = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        schema,
    } = usePasswordForm()

    const [{ loading }, onConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            try {
                await WalletRPC.setPassword(data.password)
                await Services.Helper.removePopupWindow()
            } catch (error) {
                if (error instanceof Error) {
                    setError('password', { message: error.message })
                }
            }
        },
        [history, setError],
    )

    const onSubmit = handleSubmit(onConfirm)

    return (
        <>
            <Box className={classes.header}>
                <Icons.MaskWallet size={64} />
            </Box>
            <Typography className={classes.title}>{t('popups_wallet_create_payment_password')}</Typography>
            <Typography className={classes.tip}>{t('popups_wallet_create_payment_password_tip')}</Typography>
            <form className={classes.form}>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <PasswordField
                            {...field}
                            type="password"
                            variant="filled"
                            placeholder={t('popups_wallet_payment_password')}
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
                            error={!isValid && !!errors.confirm?.message}
                            helperText={!isValid ? errors.confirm?.message : ''}
                            type="password"
                            variant="filled"
                            placeholder={t('popups_wallet_re_payment_password')}
                        />
                    )}
                    name="confirm"
                    control={control}
                />
            </form>
            <div className={classes.controller}>
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    fullWidth
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    disabled={!isValid}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default CreatePassword
