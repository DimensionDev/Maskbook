import { memo, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { useLatestRequest, useWeb3State } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../../utils/index.js'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { toUtf8 } from 'web3-utils'
import { BottomController } from '../../../components/BottomController/index.js'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service.js'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
    },
    source: {
        padding: theme.spacing(1.25),
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.25),
    },
    sourceText: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    messageTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: theme.spacing(3),
    },
    message: {
        fontSize: 12,
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        wordBreak: 'break-all',
        maxHeight: 260,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const SignRequest = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const latestRequest = useLatestRequest()
    const { Request } = useWeb3State()

    const source = params.get('source')

    const message = useMemo(() => {
        if (!latestRequest) return
        const { method, params } = latestRequest.arguments
        if (method === EthereumMethodType.ETH_SIGN || method === EthereumMethodType.ETH_SIGN_TYPED_DATA) {
            try {
                return toUtf8(params[1])
            } catch {
                return params[1]
            }
        } else if (method === EthereumMethodType.PERSONAL_SIGN) {
            return params[0]
        }
    }, [latestRequest])

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(async () => {
        if (!latestRequest) return
        await Request?.approveRequest(latestRequest.ID)
        if (source) await Services.Helper.removePopupWindow()
        navigate(-1)
    }, [latestRequest, Request, source])

    const [{ loading: cancelLoading }, handleCancel] = useAsyncFn(async () => {
        if (!latestRequest) return
        await Request?.denyRequest(latestRequest.ID)
        if (source) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [latestRequest, Request, source])

    return (
        <Box>
            <main className={classes.container}>
                <Typography className={classes.title}>{t('popups_wallet_signature_request_title')}</Typography>
                {source ? (
                    <Box className={classes.source}>
                        <Typography fontSize={16} fontWeight={700}>
                            {t('popups_wallet_request_source')}
                        </Typography>
                        <Typography className={classes.sourceText}>{source}</Typography>
                    </Box>
                ) : null}
                <Typography className={classes.messageTitle}>{t('popups_wallet_sign_message')}</Typography>
                <Typography className={classes.message}>{message}</Typography>
            </main>
            <BottomController>
                <ActionButton loading={cancelLoading} onClick={handleCancel} fullWidth variant="outlined">
                    {t('cancel')}
                </ActionButton>
                <ActionButton loading={confirmLoading} onClick={handleConfirm} fullWidth>
                    {t('confirm')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default SignRequest
