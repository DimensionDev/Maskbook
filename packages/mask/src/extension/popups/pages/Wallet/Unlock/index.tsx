import { memo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useNavigate, useLocation } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { MaskWallet as MaskWalletIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../utils'
import { PasswordField } from '../../../components/PasswordField'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { PopupRoutes } from '@masknet/shared-base'
import { useWalletLockStatus } from '../hooks/useWalletLockStatus'
import { Navigator } from '../../../components/Navigator'
import { useTitle } from '../../../hook/useTitle'

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
    const location = useLocation()
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    const [{ value: verified, loading }, handleUnlock] = useAsyncFn(async () => {
        return WalletRPC.unlockWallet(password)
    }, [password])

    const { isLocked, loading: getLockStatusLoading } = useWalletLockStatus()

    useAsync(async () => {
        if (!(isLocked === false && !getLockStatusLoading)) return
        const from = new URLSearchParams(location.search).get('from')
        navigate({ pathname: from ?? PopupRoutes.Wallet, search: location.search }, { replace: true })
    }, [isLocked, getLockStatusLoading, location.search])

    useTitle('')

    return (
        <>
            <main className={classes.contain}>
                <div className={classes.header}>
                    <MaskWalletIcon size={48} />
                    <Typography className={classes.title}>{t('popups_wallet_unlock_wallet')}</Typography>
                </div>
                <div>
                    <Typography className={classes.label}>{t('popups_wallet_confirm_payment_password')}</Typography>
                    <PasswordField
                        value={password}
                        type="password"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') handleUnlock()
                        }}
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
            <Navigator />
        </>
    )
})

export default Unlock
