import { memo, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useLocation as useRouteLocation, useNavigate } from 'react-router-dom'
import { toUtf8 } from 'web3-utils'
import { LoadingButton } from '@mui/lab'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest.js'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useWallets } from '@masknet/web3-hooks-base'
import { PopupRoutes } from '@masknet/shared-base'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'

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
        padding: '0 16px 20px 16px',
        wordBreak: 'break-all',
    },
}))

const SignRequest = memo(() => {
    const { t } = useI18N()
    const routeLocation = useRouteLocation()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { value } = useUnconfirmedRequest()

    const wallets = useWallets()
    const [transferError, setTransferError] = useState(false)

    const { data, address } = useMemo(() => {
        if (!value)
            return {
                data: '',
                address: '',
            }
        if (
            value?.payload.method === EthereumMethodType.ETH_SIGN ||
            value?.payload.method === EthereumMethodType.ETH_SIGN_TYPED_DATA
        ) {
            try {
                return {
                    address: value.payload.params?.[0],
                    data: toUtf8(value.payload.params?.[1] ?? ''),
                }
            } catch {
                return {
                    address: value.payload.params?.[0],
                    data: value.payload.params?.[1],
                }
            }
        } else if (value?.payload.method === EthereumMethodType.PERSONAL_SIGN)
            return {
                address: value.payload.params?.[1],
                data: value.payload.params?.[0],
            }

        return {
            data: '',
            address: '',
        }
    }, [value])

    const wallet = wallets.find((x) => isSameAddress(x.address, address))
    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        const goBack = new URLSearchParams(routeLocation.search).get('goBack')

        if (value) {
            try {
                await WalletRPC.confirmRequest(value.payload, {
                    disableClose: !!goBack,
                    owner: wallet?.owner,
                    identifier: wallet?.identifier,
                })
                navigate(-1)
            } catch (error_) {
                setTransferError(true)
            }
        }
    }, [value, routeLocation.search, wallet])

    const [{ loading: rejectLoading }, handleReject] = useAsyncFn(async () => {
        if (!value) return
        await WalletRPC.rejectRequest(value.payload)
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [value])

    useTitle(t('popups_wallet_signature_request_title'))

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{t('popups_wallet_signature_request')}</Typography>
                <Typography className={classes.walletName}>{wallet?.name ?? ''}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {typeof address === 'string' ? address : undefined}
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
