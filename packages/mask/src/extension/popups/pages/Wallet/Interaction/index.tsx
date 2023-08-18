import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { useChainContext, useMessages, useWeb3State } from '@masknet/web3-hooks-base'
import {
    abiCoder,
    EthereumMethodType,
    createJsonRpcPayload,
    type GasConfig,
    PayloadEditor,
    formatEthereumAddress,
    ChainId,
} from '@masknet/web3-shared-evm'
import { toHex, toUtf8 } from 'web3-utils'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useAsync, useAsyncFn } from 'react-use'
import Services from '../../../../service.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { TransactionPreview } from '../../../components/TransactionPreview/index.js'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { Icons } from '@masknet/icons'
import { useUpdateEffect } from '@react-hookz/web'
import { UnlockERC20Token } from '../../../components/UnlockERC20Token/index.js'
import { compact, mapValues, omit } from 'lodash-es'
import urlcat from 'urlcat'
import { WalletAssetTabs } from '../type.js'

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
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
    },
    document: {
        color: theme.palette.maskColor.second,
    },
    data: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
        wordBreak: 'break-all',
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    itemValue: {
        fontSize: 12,
        fontWeight: 700,
    },
}))

const signRequest = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.PERSONAL_SIGN,
]

const approveParametersType = [
    {
        name: 'spender',
        type: 'address',
    },
    {
        name: 'value',
        type: 'uint256',
    },
]

const Interaction = memo(function Interaction() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [index, setIndex] = useState(0)
    const [approveAmount, setApproveAmount] = useState('')
    const [expand, setExpand] = useState(false)
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const [paymentToken, setPaymentToken] = useState('')

    const messages = useMessages()

    const { showSnackbar } = usePopupCustomSnackbar()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Message, TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const source = params.get('source')
    const currentRequest = useMemo(() => {
        if (!messages?.length) return
        return messages[index]
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

    const { value: transaction, loading } = useAsync(async () => {
        if (!currentRequest?.request) return

        const payload = createJsonRpcPayload(0, currentRequest.request.arguments)
        const computedPayload = PayloadEditor.fromPayload(payload).config
        const formattedTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
        const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)

        return {
            ...currentRequest.request.options,
            payload,
            computedPayload,
            formattedTransaction,
            transactionContext,
        }
    }, [currentRequest, chainId, TransactionFormatter])

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (!currentRequest) return

            let params = currentRequest.request.arguments.params

            if (approveAmount) {
                if (!transaction?.formattedTransaction?._tx.data) return

                const parameters = abiCoder.decodeParameters(
                    approveParametersType,
                    transaction?.formattedTransaction._tx.data.slice(10),
                )

                const parametersString = abiCoder
                    .encodeParameters(approveParametersType, [parameters.spender, toHex(approveAmount)])
                    .slice(2)

                const result = `${transaction.formattedTransaction._tx.data.slice(0, 10)}${parametersString}`

                params = compact(
                    currentRequest.request.arguments.params.map((x) =>
                        x === 'latest'
                            ? chainId !== ChainId.Celo
                                ? x
                                : undefined
                            : {
                                  ...x,
                                  data: result,
                              },
                    ),
                )
            }

            if (!signRequest.includes(currentRequest.request.arguments.method)) {
                params = compact(
                    params.map((x) => {
                        if (x === 'latest') {
                            if (chainId === ChainId.Celo) return
                            return x
                        }

                        return {
                            ...x,
                            ...(gasConfig
                                ? mapValues(omit(gasConfig, 'gasOptionType'), (value, key) => {
                                      if (key === 'gasCurrency' || !value) return
                                      return toHex(value)
                                  })
                                : {}),

                            chainId: toHex(x.chainId),
                            nonce: toHex(x.nonce),
                        }
                    }),
                )
            }

            await Message?.approveRequest(currentRequest.ID, {
                ...currentRequest.request,
                arguments: {
                    ...currentRequest.request.arguments,
                    params,
                },
                options: {
                    ...currentRequest.request.options,
                    paymentToken,
                },
            })
            if (source) await Services.Helper.removePopupWindow()
            navigate(urlcat(PopupRoutes.Wallet, { tab: WalletAssetTabs.Activity }), { replace: true })
        } catch (error) {
            showSnackbar(
                <Typography textAlign="center" width="275px">
                    {t('popups_wallet_rpc_error')}
                </Typography>,
                {
                    variant: 'error',
                },
            )
        }
    }, [
        chainId,
        currentRequest,
        Message,
        source,
        gasConfig,
        approveAmount,
        transaction?.formattedTransaction?._tx.data,
        paymentToken,
    ])

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

    const content = useMemo(() => {
        if (currentRequest && signRequest.includes(currentRequest?.request.arguments.method)) {
            return <SignRequestInfo message={message} source={source} />
        }

        if (transaction?.formattedTransaction?.popup?.spender) {
            return (
                <UnlockERC20Token
                    onConfigChange={handleChangeGasConfig}
                    paymentToken={paymentToken}
                    onPaymentTokenChange={(paymentToken) => setPaymentToken(paymentToken)}
                    transaction={transaction}
                    handleChange={(value) => setApproveAmount(value)}
                />
            )
        }

        return (
            <TransactionPreview
                transaction={transaction}
                onConfigChange={handleChangeGasConfig}
                paymentToken={paymentToken}
                onPaymentTokenChange={(paymentToken) => setPaymentToken(paymentToken)}
            />
        )
    }, [message, source, transaction, handleChangeGasConfig, currentRequest, paymentToken])

    // clear gas config when index has been changed
    useUpdateEffect(() => {
        setGasConfig(undefined)
        setExpand(false)
        setApproveAmount('')
        setPaymentToken('')
    }, [index])

    useEffect(() => {
        if (!messages.length) return
        setIndex(messages.length - 1)
    }, [messages.length])

    // update default payment token from transaction
    useEffect(() => {
        if (!transaction?.paymentToken) return

        setPaymentToken((prev) => {
            if (prev) return prev
            return transaction.paymentToken ?? ''
        })
    }, [transaction?.paymentToken])

    if (!currentRequest) return

    if (loading) {
        return <LoadingPlaceholder />
    }

    return (
        <Box flex={1} display="flex" flexDirection="column">
            <Box p={2} display="flex" flexDirection="column" flex={1} maxHeight="458px" overflow="auto">
                {content}
                {currentRequest && !signRequest.includes(currentRequest?.request.arguments.method) ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mt={2}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpand(!expand)}>
                        <Typography className={classes.text}>
                            {t('popups_wallet_view_full_detail_transaction')}
                        </Typography>
                        <Icons.ArrowDrop
                            size={16}
                            sx={{ marginLeft: 0.5 }}
                            className={cx(classes.arrowIcon, expand ? classes.expand : undefined)}
                        />
                    </Box>
                ) : null}

                {expand ? (
                    <Box
                        className={classes.transactionDetail}
                        style={{ marginBottom: expand && messages.length <= 1 ? 0 : 16 }}>
                        {transaction?.formattedTransaction?.popup?.spender && approveAmount ? (
                            <>
                                <Box display="flex" alignItems="center" columnGap={1.25}>
                                    <Typography className={classes.itemTitle}>
                                        {t('popups_wallet_unlock_erc20_approve_amount')}
                                    </Typography>
                                    <Typography className={classes.itemValue}>{approveAmount}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" columnGap={1.25}>
                                    <Typography className={classes.itemTitle}>
                                        {t('popups_wallet_unlock_erc20_granted_to')}
                                    </Typography>
                                    <Typography className={classes.itemValue}>
                                        {formatEthereumAddress(transaction.formattedTransaction.popup.spender, 4)}
                                    </Typography>
                                </Box>
                            </>
                        ) : null}
                        <Box display="flex" columnGap={0.5} alignItems="center">
                            <Icons.Documents className={classes.document} size={16} />
                            <Typography className={classes.text}>{t('data')}</Typography>
                        </Box>
                        {transaction?.formattedTransaction?.popup?.method ? (
                            <Typography className={classes.text}>
                                {t('popups_wallet_transaction_function_name', {
                                    name: transaction?.formattedTransaction.popup.method,
                                })}
                            </Typography>
                        ) : null}
                        {transaction?.formattedTransaction?._tx.data ? (
                            <Typography className={classes.data}>
                                {transaction.formattedTransaction._tx.data}
                            </Typography>
                        ) : null}
                    </Box>
                ) : null}

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
                                className={cx(
                                    classes.right,
                                    index === messages.length - 1 ? classes.disabled : undefined,
                                )}
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
                    {signRequest.includes(currentRequest?.request.arguments.method) ? t('sign') : t('confirm')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default Interaction
