import { memo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { MaskWalletIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { EnterDashboard } from '../../../components/EnterDashboard'
import { useI18N } from '../../../../../utils'
import { PasswordField } from '../../../components/PasswordField'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { PopupRoutes } from '../../../index'
import { useWalletLockStatus } from '../hooks/useWalletLockStatus'

const useStyles = makeStyles()((theme) => ({
    contain: {
        flex: 1,
        padding: '0 16px',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        padding: '50px 0',
    },
    title: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        color: '#15181B',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        fontWeight: 600,
        marginTop: 50,
        padding: '9px 0',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
}))

const Unlock = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')

    const history = useHistory()

    const [{ value: verified, loading }, handleUnlock] = useAsyncFn(async () => {
        return WalletRPC.unlockWallet(password)
    }, [password])

    const { isLocked, loading: getLockStatusLoading } = useWalletLockStatus()

    useAsync(async () => {
        if (isLocked === false && !getLockStatusLoading) {
            history.replace(PopupRoutes.Wallet)
        }
    }, [isLocked, getLockStatusLoading])

    return (
        <>
            <main className={classes.contain}>
                <div className={classes.header}>
                    <MaskWalletIcon style={{ fontSize: 48 }} />
                    <Typography className={classes.title}>{t('popups_wallet_unlock_wallet')}</Typography>
                </div>
                <div>
                    <Typography className={classes.label}>{t('popups_wallet_confirm_payment_password')}</Typography>
                    <PasswordField
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        error={verified === false}
                        helperText={verified === false ? t('popups_wallet_unlock_error_password') : ''}
                    />
                </div>
                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    disabled={!password}
                    onClick={handleUnlock}>
                    {t('unlock')}
                </LoadingButton>
            </main>
            <EnterDashboard />
        </>
    )
})

export default Unlock
