import { memo, useMemo } from 'react'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { EthereumRpcType, useWallet } from '@masknet/web3-shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service'
import { LoadingButton } from '@material-ui/lab'
import { useHistory, useLocation } from 'react-router'
import { PopupRoutes } from '../../../index'
import { useRejectHandler } from '../hooks/useRejectHandler'

const useStyles = makeStyles()(() => ({
    container: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    info: {
        backgroundColor: '#F7F9FA',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        color: '#15181B',
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    walletName: {
        color: '#15181B',
        fontSize: 16,
        lineHeight: '22px',
        margin: '10px 0',
    },
    secondary: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    message: {
        color: '#15181B',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
}))

const SignRequest = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const location = useLocation()
    const { classes } = useStyles()
    const { value } = useUnconfirmedRequest()
    const wallet = useWallet()

    const { data, address } = useMemo(() => {
        if (value?.computedPayload?.type === EthereumRpcType.SIGN) {
            return {
                address: value.computedPayload.to,
                data: value.computedPayload.data,
            }
        }
        return {
            address: '',
            data: '',
        }
    }, [value])

    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (value) {
            const toBeClose = new URLSearchParams(location.search).get('toBeClose')

            await WalletRPC.deleteUnconfirmedRequest(value.payload)
            await Services.Ethereum.confirmRequest(value.payload)

            if (toBeClose) {
                window.close()
            } else {
                history.replace(PopupRoutes.Wallet)
            }
        }
    }, [value, location.search, history])

    const [{ loading: rejectLoading }, handleReject] = useRejectHandler(
        () => history.replace(PopupRoutes.Wallet),
        value,
    )

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{t('popups_wallet_signature_request')}</Typography>
                <Typography className={classes.walletName}>{wallet?.name ?? ''}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {address}
                </Typography>
            </div>
            <Typography className={classes.secondary} style={{ marginTop: 20 }}>
                {t('popups_wallet_signature_request_message')}:
            </Typography>
            <Typography className={classes.message}>{data}</Typography>
            <div className={classes.controller}>
                <LoadingButton
                    loading={rejectLoading}
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={handleReject}>
                    {t('cancel')}
                </LoadingButton>
                <LoadingButton loading={loading} variant="contained" className={classes.button} onClick={handleConfirm}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </main>
    )
})

export default SignRequest
