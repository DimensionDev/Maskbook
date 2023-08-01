import { memo, useCallback, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { useChainContext, useMessages, useWeb3State } from '@masknet/web3-hooks-base'
import { EthereumMethodType, createJsonRpcPayload, type GasConfig, PayloadEditor } from '@masknet/web3-shared-evm'
import { toHex, toUtf8 } from 'web3-utils'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useAsync, useAsyncFn } from 'react-use'
import Services from '../../../../service.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { TransactionPreview } from '../../../components/TransactionPreview/index.js'
import type { GasParams } from '../type.js'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { Icons } from '@masknet/icons'
import { useUpdateEffect } from '@react-hookz/web'

const useStyles = makeStyles()((theme) => ({
    left: {
        transform: 'rotate(90deg)',
        cursor: 'pointer',
    },
    right: {
        transform: 'rotate(-90deg)',
        cursor: 'pointer',
    },
    disabled: {
        color: theme.palette.maskColor.second,
        cursor: 'unset',
    },
    text: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
    arrowIcon: {
        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
    expand: {
        transform: 'rotate(180deg)',
    },
    transactionDetail: {
        padding: theme.spacing(1.5),
        margin: theme.spacing(2, 0),
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
    },
    document: {
        color: theme.palette.maskColor.second,
    },
    data: {
        marginTop: theme.spacing(1.25),
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
        wordBreak: 'break-all',
    },
    hidden: {
        visibility: 'hidden',
    },
}))

const signRequest = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.PERSONAL_SIGN,
]

const Interaction = memo(function Interaction() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [index, setIndex] = useState(0)
    const [expand, setExpand] = useState(false)
    const [gasConfig, setGasConfig] = useState<GasParams | undefined>()
    const messages = useMessages()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Message, TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const source = params.get('source')
    const currentRequest = useMemo(() => {
        if (!messages?.length) return
        return messages.reverse()[index]
    }, [messages, index])

    const message = useMemo(() => {
        if (!currentRequest || !signRequest.includes(currentRequest.request.arguments.method)) return
        const { method, params } = currentRequest.request.arguments
        if (method === EthereumMethodType.ETH_SIGN || method === EthereumMethodType.ETH_SIGN_TYPED_DATA) {
            try {
                return toUtf8(params[1])
            } catch {
                return params[1]
            }
        } else if (method === EthereumMethodType.PERSONAL_SIGN) {
            return params[0]
        }
    }, [currentRequest])

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(async () => {
        if (!currentRequest) return

        const params = !gasConfig
            ? currentRequest.request.arguments.params
            : currentRequest.request.arguments.params.map((x) =>
                  x === 'latest'
                      ? x
                      : {
                            ...x,
                            gasPrice: gasConfig.gasPrice ? toHex(gasConfig.gasPrice) : x.gasPrice,
                            maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas
                                ? toHex(gasConfig.maxPriorityFeePerGas)
                                : x.maxPriorityFeePerGas,
                            maxFeePerGas: gasConfig.maxFeePerGas ? toHex(gasConfig.maxFeePerGas) : x.maxFeePerGas,
                        },
              )

        await Message?.approveRequest(currentRequest.ID, {
            request: {
                ...currentRequest.request,
                arguments: {
                    ...currentRequest.request.arguments,
                    params,
                },
            },
        })
        if (source) await Services.Helper.removePopupWindow()
        navigate(-1)
    }, [currentRequest, Message, source, gasConfig])

    const [{ loading: cancelLoading }, handleCancel] = useAsyncFn(async () => {
        if (!currentRequest) return
        await Message?.denyRequest(currentRequest.ID)
        if (source) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [currentRequest, Message, source])

    const [{ loading: cancelAllLoading }, handleCancelAllRequest] = useAsyncFn(async () => {
        await Message?.denyAllRequests()
        if (source) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [Message, source])

    const handleChangeGasConfig = useCallback((config: GasConfig) => {
        setGasConfig(config)
    }, [])

    const { value: transaction, loading } = useAsync(async () => {
        if (!currentRequest?.request) return

        const payload = createJsonRpcPayload(0, currentRequest.request.arguments)
        const computedPayload = PayloadEditor.fromPayload(payload).config
        const formattedTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
        const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)

        return {
            owner: currentRequest.request.options?.owner,
            paymentToken: currentRequest.request.options?.paymentToken,
            allowMaskAsGas: currentRequest.request.options?.allowMaskAsGas,
            payload,
            computedPayload,
            formattedTransaction,
            transactionContext,
        }
    }, [currentRequest, chainId, TransactionFormatter])

    const content = useMemo(() => {
        if (currentRequest && signRequest.includes(currentRequest?.request.arguments.method)) {
            return <SignRequestInfo message={message} source={source} />
        }

        return <TransactionPreview transaction={transaction} onConfigChange={handleChangeGasConfig} />
    }, [message, source, transaction, handleChangeGasConfig, currentRequest])

    // clear gas config when index has been changed
    useUpdateEffect(() => {
        setGasConfig(undefined)
        setExpand(false)
    }, [index])

    if (!currentRequest) return

    if (loading) {
        return <LoadingPlaceholder />
    }

    return (
        <Box flex={1} display="flex" flexDirection="column">
            <Box p={2} display="flex" flexDirection="column">
                {content}
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mt={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpand(!expand)}>
                    <Typography className={classes.text}>{t('popups_wallet_view_full_detail_transaction')}</Typography>
                    <Icons.ArrowDrop
                        size={16}
                        sx={{ marginLeft: 0.5 }}
                        className={cx(classes.arrowIcon, expand ? classes.expand : undefined)}
                    />
                </Box>

                <Box className={cx(classes.transactionDetail, !expand ? classes.hidden : undefined)}>
                    <Box display="flex" columnGap={0.5} alignItems="center">
                        <Icons.Documents className={classes.document} size={16} />
                        <Typography className={classes.text}>{t('data')}</Typography>
                    </Box>
                    {transaction?.formattedTransaction?.popup?.method ? (
                        <Typography className={classes.text} mt={1.25}>
                            {t('popups_wallet_transaction_function_name', {
                                name: transaction?.formattedTransaction.popup.method,
                            })}
                        </Typography>
                    ) : null}
                    {transaction?.formattedTransaction?._tx.data ? (
                        <Typography className={classes.data}>{transaction.formattedTransaction._tx.data}</Typography>
                    ) : null}
                </Box>

                {messages.length > 1 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" marginTop="auto" marginBottom={9}>
                        <Box display="flex" alignItems="center">
                            <Icons.ArrowDrop
                                size={16}
                                className={cx(classes.left, index === 0 ? classes.disabled : undefined)}
                                onClick={() => {
                                    if (index === 0) return
                                    setIndex(index - 1)
                                }}
                            />
                            <Typography className={classes.text}>
                                {t('popups_wallet_multiple_requests', { index: index + 1, total: messages.length })}
                            </Typography>
                            <Icons.ArrowDrop
                                size={16}
                                className={classes.right}
                                onClick={() => {
                                    if (index === messages.length - 1) return
                                    setIndex(index + 1)
                                }}
                            />
                        </Box>

                        <ActionButton
                            variant="text"
                            color="info"
                            onClick={handleCancelAllRequest}
                            loading={cancelAllLoading}>
                            {t('popups_wallet_reject_all_requests', { total: messages.length })}
                        </ActionButton>
                    </Box>
                ) : null}
            </Box>
            <BottomController>
                <ActionButton loading={cancelLoading} onClick={handleCancel} fullWidth variant="outlined">
                    {t('cancel')}
                </ActionButton>
                <ActionButton loading={confirmLoading} onClick={handleConfirm} fullWidth>
                    {t('sign')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default Interaction
