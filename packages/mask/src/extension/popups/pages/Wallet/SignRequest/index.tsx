import { memo, useMemo, useState } from 'react'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../../../../utils'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import { LoadingButton } from '@mui/lab'
import { toUtf8 } from 'web3-utils'
import { useNavigate, useLocation } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { EVM_RPC } from '@masknet/plugin-evm/src/messages'
import { useWallet } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, TransactionDescriptorType } from '@masknet/web3-shared-base'

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
        wordBreak: 'break-all',
        maxHeight: 260,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        lineHeight: '16px',
        padding: '0px 16px 20px 16px',
        wordBreak: 'break-all',
    },
}))

const SignRequest = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const location = useLocation()
    const { classes } = useStyles()
    const { value, loading: requestLoading } = useUnconfirmedRequest()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const [transferError, setTransferError] = useState(false)

    const { data, address } = useMemo(() => {
        if (
            value?.computedPayload?.type === TransactionDescriptorType.SIGN ||
            value?.computedPayload?.type === TransactionDescriptorType.SIGN_TYPED_DATA
        ) {
            let message = value.computedPayload.data
            try {
                message = toUtf8(message)
            } catch (error) {
                console.log(error)
            }
            return {
                address: value.computedPayload.to,
                data: message,
            }
        }
        return {
            address: '',
            data: '',
        }
    }, [value])

    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        try {
            await EVM_RPC.confirmRequest()
        } catch (error_) {
            setTransferError(true)
        }
    }, [value, location.search, history])

    const [{ loading: rejectLoading }, handleReject] = useAsyncFn(async () => {
        if (!value) return
        await EVM_RPC.rejectRequest()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [value])

    useUpdateEffect(() => {
        if (!value && !requestLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [value, requestLoading])

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
            {transferError ? (
                <Typography className={classes.error}>{t('popups_wallet_transfer_error_tip')}</Typography>
            ) : null}
            <div className={classes.controller}>
                <LoadingButton
                    loading={rejectLoading}
                    variant="contained"
                    className={classes.button}
                    style={!rejectLoading ? { backgroundColor: '#F7F9FA', color: '#1C68F3' } : undefined}
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
