import { memo, useCallback } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletInfo } from '../components/WalletInfo'
import { WarningIcon } from '@masknet/icons'
import { useHistory } from 'react-router-dom'
import { useWallet } from '@masknet/web3-shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'
import { PopupRoutes } from '../../../index'
import { first } from 'lodash-es'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
    },
    warning: {
        padding: '27px 0 13px 0',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    title: {
        marginTop: 14,
        color: ' #FF5F5F',
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
    },
    tip: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        margin: '20px 0',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: '0 16px 16px 16px',
    },
    cancelButton: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        color: '#1C68F3',
        lineHeight: '20px',
        backgroundColor: '#F7F9FA',
    },
    deleteButton: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        color: '#ffffff',
        lineHeight: '20px',
        backgroundColor: '#FF5F5F',
    },
})

//TODO: password confirm
const DeleteWallet = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const wallet = useWallet()
    const { classes } = useStyles()
    // const [password, setPassword] = useState('')

    const onConfirm = useCallback(async () => {
        if (wallet?.address) {
            await WalletRPC.removeWallet(wallet.address)
            const wallets = await WalletRPC.getWallets()
            if (wallets.length) {
                await WalletRPC.resetAccount({
                    account: first(wallets)?.address,
                })
            }
            history.replace(PopupRoutes.Wallet)
        }
    }, [wallet])

    return (
        <>
            <WalletInfo />
            <div className={classes.content}>
                <div className={classes.warning}>
                    <WarningIcon style={{ fontSize: 48 }} />
                    <Typography className={classes.title}>Delete Wallet</Typography>
                </div>
                <Typography className={classes.tip}>{t('popups_wallet_delete_tip')}</Typography>
                {/*<Typography className={classes.label}>{t('popups_wallet_confirm_payment_password')}</Typography>*/}
                {/*<StyledInput*/}
                {/*    placeholder="Input your password"*/}
                {/*    value={password}*/}
                {/*    onChange={(e) => setPassword(e.target.value)}*/}
                {/*/>*/}
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    color="inherit"
                    className={classes.cancelButton}
                    onClick={() => history.goBack()}
                >
                    {t('cancel')}
                </Button>
                <Button variant="contained" color="error" className={classes.deleteButton} onClick={onConfirm}>
                    {t('delete')}
                </Button>
            </div>
        </>
    )
})

export default DeleteWallet
