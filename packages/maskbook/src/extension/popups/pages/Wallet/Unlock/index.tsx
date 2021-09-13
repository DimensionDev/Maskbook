import { memo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { EnterDashboard } from '../../../components/EnterDashboard'
import { MaskWalletIcon } from '@masknet/icons'
import { Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@material-ui/lab'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useHistory } from 'react-router'
import { PopupRoutes } from '../../../index'

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
        marginTop: 50,
        padding: '9px 0',
        borderRadius: 20,
    },
}))

const Unlock = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')

    const history = useHistory()
    const [{ loading, value }, handleUnlock] = useAsyncFn(async () => {
        const result = await WalletRPC.decryptWallet(password)
        if (result.ok) {
            history.replace(PopupRoutes.Wallet)
        }
        return result
    }, [password])

    return (
        <>
            <main className={classes.contain}>
                <div className={classes.header}>
                    <MaskWalletIcon style={{ fontSize: 48 }} />
                    <Typography className={classes.title}>{t('popups_wallet_unlock_wallet')}</Typography>
                </div>
                <div>
                    <Typography className={classes.label}>{t('popups_wallet_confirm_payment_password')}</Typography>
                    <StyledInput
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        error={value?.err}
                        helperText={value?.err ? t('popups_wallet_unlock_error_password') : ''}
                    />
                </div>
                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    className={classes.button}
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
