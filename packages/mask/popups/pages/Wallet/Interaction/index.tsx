import { compact, mapValues, omit } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import {
    memo,
    useEffect,
    useMemo,
    useState,
    type MouseEventHandler,
    Suspense,
    useTransition,
    useLayoutEffect,
    useCallback,
} from 'react'
import { BigNumber } from 'bignumber.js'
import { useAsyncFn, useLatest } from 'react-use'
import { Icons } from '@masknet/icons'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    IconButton,
    Typography,
} from '@mui/material'
import { useChainContext, useMessages, useWallet, useWeb3State } from '@masknet/web3-hooks-base'
import {
    abiCoder,
    EthereumMethodType,
    createJsonRpcPayload,
    type GasConfig,
    PayloadEditor,
    formatEthereumAddress,
    ChainId,
    ErrorEditor,
    type MessageRequest,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { useNavigate } from 'react-router-dom'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import Services from '#services'
import { WalletAssetTabs, type TransactionDetail } from '../type.js'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { TransactionPreview } from '../../../components/TransactionPreview/index.js'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { UnlockERC20Token } from '../../../components/UnlockERC20Token/index.js'
import { UnlockERC721Token } from '../../../components/UnlockERC721Token/index.js'
import type { JsonRpcResponse } from 'web3-core-helpers'
import {
    type ReasonableMessage,
    parseEIP4361Message,
    type EIP4361Message,
    TransactionDescriptorType,
    GasOptionType,
    TokenType,
} from '@masknet/web3-shared-base'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useInteractionWalletContext } from './InteractionContext.js'
import { produce } from 'immer'
import { WatchTokenRequest } from '../../../components/WatchTokenRequest/index.js'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    left: {
        transform: 'rotate(90deg)',
    },
    right: {
        transform: 'rotate(-90deg)',
    },
    text: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
    arrowIcon: {
        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        marginLeft: 0.5,
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
    EthereumMethodType.eth_sign,
    EthereumMethodType.eth_signTypedData_v4,
    EthereumMethodType.personal_sign,
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

/**
 * string: personal_sign
 * object: eth_signTypedData_v4/eth_signTypedData/eth_signTypedData_v3/eth_sign
 */
type RawSigningMessage = string | object | undefined
/**
 * string: utf-8 string parsed from hex string like "0x..."
 * EIP4361Message: parsed from EIP4361 message
 */
type ParsedSigningMessage = string | EIP4361Message | undefined

const InteractionFrame = memo(() => {
    const navigate = useNavigate()
    const messages = useMessages()
    const [messageIndex, setMessageIndex] = useState(0)
    const currentRequest = messages.at(messageIndex)
    {
        const [prevLength, setPrev] = useState(messages.length)
        prevLength !== messages.length && setPrev(messages.length)
        if (messages.length) {
            if (messageIndex < 0) setMessageIndex(0)
            // if a new message comes in, switch to that message.
            else if (messageIndex >= messages.length || prevLength !== messages.length)
                setMessageIndex(messages.length - 1)
        }
    }
    useLayoutEffect(() => {
        if (!messages.length) navigate(PopupRoutes.Wallet, { replace: true })
    }, [messages.length, navigate])

    if (!currentRequest) return null
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <Interaction
                currentRequest={currentRequest}
                totalMessages={messages.length}
                currentMessageIndex={messageIndex}
                setMessageIndex={setMessageIndex}
            />
        </Suspense>
    )
})
InteractionFrame.displayName = 'InteractionFrame'

interface InteractionProps {
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    totalMessages: number
    currentMessageIndex: number
    setMessageIndex(count: number): void
}

// TODO: interaction need a refactor: split all different kinds of interactions out.
const Interaction = memo((props: InteractionProps) => {
    const { currentRequest, totalMessages, currentMessageIndex, setMessageIndex } = props
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [paymentToken, setPaymentToken] = useState('')
    const [, startTransition] = useTransition()
    const requestOrigin = currentRequest.origin
    const wallet = useWallet()

    const { showSnackbar } = usePopupCustomSnackbar()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Message, TransactionFormatter, Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const rawMessage = useMemo((): RawSigningMessage => {
        if (!signRequest.includes(currentRequest.request.arguments.method)) return undefined
        const { method, params } = currentRequest.request.arguments

        if (method === EthereumMethodType.eth_signTypedData_v4) {
            if (typeof params[1] === 'object') return params[1]
            return undefined
        }
        if (method === EthereumMethodType.personal_sign) {
            if (typeof params[0] === 'string') return params[0]
            return undefined
        }
        if (method === EthereumMethodType.eth_sign) {
            if (typeof params[1] === 'string') return params[1]
            return undefined
        }
        return undefined
    }, [currentRequest])
    const message: ParsedSigningMessage = useMemo(() => {
        if (typeof rawMessage !== 'string') return undefined
        const plain = tryParseStringMessage(rawMessage)
        return parseEIP4361Message(plain, requestOrigin) || plain
    }, [rawMessage, requestOrigin])

    let transaction: TransactionDetail
    {
        const client = useQueryClient()
        const queryKey = ['popup', 'wallet', 'interaction', currentRequest.ID, chainId]
        ;({ data: transaction } = useSuspenseQuery({
            queryKey,
            networkMode: 'always',
            queryFn: async (): Promise<TransactionDetail> => {
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
            },
        }))
        const latest = useLatest(queryKey)
        useEffect(() => {
            client.refetchQueries({ queryKey: latest.current })
        }, [TransactionFormatter, client])
    }

    // set current interacting wallet
    {
        let interactingWallet: string | undefined
        // TODO: does this support EIP-4337 wallet correctly?
        getInteractingWallet: {
            const req = currentRequest.request.arguments
            if (!req) break getInteractingWallet
            if (req.method === EthereumMethodType.eth_signTypedData_v4) interactingWallet = req.params[0]
            if (req.method === EthereumMethodType.personal_sign) interactingWallet = req.params[1]
            if (req.method === EthereumMethodType.eth_sendTransaction) interactingWallet = req.params[0]?.from

            interactingWallet = String(interactingWallet)
            if (interactingWallet && !interactingWallet.startsWith('0x')) interactingWallet = undefined
        }
        const { setInteractionWallet } = useInteractionWalletContext()
        useEffect(() => {
            setInteractionWallet(interactingWallet)
        }, [interactingWallet, setInteractionWallet])
    }

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(
        async (paymentToken: string, approveAmount: string, gasConfig: GasConfig | undefined) => {
            try {
                let params = currentRequest.request.arguments.params
                if (currentRequest.request.arguments.method === EthereumMethodType.wallet_watchAsset) {
                    const type = params[0].type
                    const address = params[0].options.address
                    if (type === 'ERC21') {
                        // TODO: custom name currently are ignored
                        await Token?.addToken?.(wallet!.address, {
                            address,
                            chainId,
                            schema: SchemaType.ERC20,
                            type: TokenType.Fungible,
                            id: `${chainId}.${address}`,
                            isCustomToken: true,
                        })
                    } else if (type === 'ERC721' || type === 'ERC1155') {
                        const { tokenId, symbol, name = 'NFT' } = params[0].options
                        const schema = type === 'ERC21' ? SchemaType.ERC721 : SchemaType.ERC1155
                        await Token?.addNonFungibleTokens?.(
                            wallet!.address,
                            { address, chainId, name, schema, symbol },
                            [tokenId],
                        )
                        await Token?.addToken?.(wallet!.address, {
                            id: `${chainId}.${address}.${tokenId}`,
                            chainId,
                            tokenId,
                            type: TokenType.NonFungible,
                            schema,
                            address,
                            isCustomToken: true,
                        })
                    }
                    // It is "deny" because we don't want it being send to the upstream Ethereum RPC.
                    await Message?.denyRequest(currentRequest.ID)
                } else {
                    if (approveAmount) {
                        if (!transaction.formattedTransaction?._tx.data) return

                        const parameters = abiCoder.decodeParameters(
                            approveParametersType,
                            transaction.formattedTransaction._tx.data.slice(10),
                        )

                        const parametersString = abiCoder
                            .encodeParameters(approveParametersType, [
                                parameters.spender,
                                web3_utils.toHex(approveAmount),
                            ])
                            .slice(2)

                        const result = `${transaction.formattedTransaction._tx.data.slice(0, 10)}${parametersString}`

                        params = compact(
                            currentRequest.request.arguments.params.map((x) =>
                                x === 'latest' ?
                                    chainId !== ChainId.Celo ?
                                        x
                                    :   undefined
                                :   {
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
                                    ...(gasConfig ?
                                        mapValues(omit(gasConfig, 'gasOptionType'), (value, key) => {
                                            if (key === 'gasCurrency' || !value) return
                                            return web3_utils.toHex(value)
                                        })
                                    :   {}),
                                    gasLimit: web3_utils.toHex(new BigNumber(gasConfig?.gas ?? x.gas).toString()),
                                    chainId: web3_utils.toHex(x.chainId),
                                    nonce: web3_utils.toHex(x.nonce),
                                }
                            }),
                        )
                    }

                    if (currentRequest.request.arguments.method === EthereumMethodType.eth_signTypedData_v4) {
                        if (typeof params[1] === 'object') params[1] = JSON.stringify(params[1])
                    }

                    if (currentRequest.request.arguments.method === EthereumMethodType.eth_sendTransaction) {
                        if (params[0].type === '0x0') {
                            delete params[0].type
                            delete params[0].gasPrice
                        }
                    }
                    const response = await Message?.approveRequest(currentRequest.ID, {
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
                    const editor = response ? ErrorEditor.from(null, response) : undefined
                    if (editor?.presence) throw editor.error
                }
                if (requestOrigin) await Services.Helper.removePopupWindow()
                navigate(urlcat(PopupRoutes.Wallet, { tab: WalletAssetTabs.Activity }), { replace: true })
            } catch (error) {
                showSnackbar(
                    <Typography textAlign="center" width="275px">
                        {t.popups_wallet_rpc_error()}
                        <br />
                        {String((error as any).message)}
                    </Typography>,
                    {
                        variant: 'error',
                        autoHideDuration: 5000,
                    },
                )
            }
        },
        [
            chainId,
            currentRequest,
            Message,
            requestOrigin,
            transaction.formattedTransaction?._tx.data,
            Token,
            wallet?.address,
        ],
    )

    const [{ loading: cancelLoading }, handleCancel] = useAsyncFn(async () => {
        await Message?.denyRequest(currentRequest.ID)
        if (requestOrigin) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [currentRequest, Message, requestOrigin])

    const [{ loading: cancelAllLoading }, handleCancelAllRequest] = useAsyncFn(async () => {
        await Message?.denyAllRequests()
        if (requestOrigin) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [Message, requestOrigin])

    // update default payment token from transaction
    if (!paymentToken && transaction.paymentToken) {
        setPaymentToken(transaction.paymentToken)
    }

    const pager =
        totalMessages > 1 ?
            <Box display="flex" flexDirection="column" alignItems="center" marginTop="auto">
                <Box display="flex" alignItems="center">
                    <IconButton
                        disabled={currentMessageIndex === 0}
                        onClick={() => startTransition(() => setMessageIndex(currentMessageIndex - 1))}>
                        <Icons.ArrowDrop size={16} className={classes.left} />
                    </IconButton>
                    <Typography className={classes.text}>
                        {t.popups_wallet_multiple_requests({
                            index: String(currentMessageIndex + 1),
                            total: String(totalMessages),
                        })}
                    </Typography>
                    <IconButton
                        onClick={() => startTransition(() => setMessageIndex(currentMessageIndex + 1))}
                        disabled={currentMessageIndex === totalMessages - 1}>
                        <Icons.ArrowDrop size={16} className={classes.right} />
                    </IconButton>
                </Box>

                <ActionButton variant="text" color="info" onClick={handleCancelAllRequest} loading={cancelAllLoading}>
                    {t.popups_wallet_reject_all_requests({ total: String(totalMessages) })}
                </ActionButton>
            </Box>
        :   null
    return (
        <InteractionItem
            key={currentRequest.ID}
            paymentToken={paymentToken}
            setPaymentToken={setPaymentToken}
            currentRequest={currentRequest}
            message={message}
            rawMessage={rawMessage}
            transaction={transaction}
            cancelRunning={cancelLoading}
            confirmRunning={confirmLoading}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            requestOrigin={requestOrigin}
            pager={pager}
        />
    )
})
Interaction.displayName = 'Interaction'

const InteractionItem = memo((props: InteractionItemProps) => {
    const {
        message,
        rawMessage,
        requestOrigin,
        currentRequest,
        transaction,
        pager,
        cancelRunning,
        confirmRunning,
        onCancel,
        onConfirm,
        paymentToken,
        setPaymentToken,
    } = props
    const actionRunning = cancelRunning || confirmRunning

    const t = useMaskSharedTrans()
    const { classes, cx } = useStyles()
    const [expand, setExpand] = useState(
        transaction.formattedTransaction?.type === TransactionDescriptorType.DEPLOYMENT,
    )

    const [approvedAmount, setApproveAmount] = useState('')
    const [gasConfig, _setGasConfig] = useState<GasConfig | undefined>()
    const { Message } = useWeb3State()
    const setGasConfig = useCallback(
        (gasConfig: GasConfig) => {
            _setGasConfig(gasConfig)
            Message?.updateMessage(
                currentRequest.ID,
                produce(currentRequest, (draft) => {
                    if (gasConfig.gasOptionType) draft.request.options.gasOptionType = gasConfig.gasOptionType
                    if (gasConfig.gasOptionType === GasOptionType.CUSTOM) {
                        draft.request.options.gas = gasConfig.gas
                        if ('gasPrice' in gasConfig) {
                            if (gasConfig.gasPrice) draft.request.options.gasPrice = gasConfig.gasPrice
                        } else {
                            if (gasConfig.maxFeePerGas) draft.request.options.maxFeePerGas = gasConfig.maxFeePerGas
                            if (gasConfig.maxPriorityFeePerGas)
                                draft.request.options.maxPriorityFeePerGas = gasConfig.maxPriorityFeePerGas
                        }
                    } else if (gasConfig.gasOptionType) {
                        // remove them to use new default next time.
                        delete draft.request.options.gas
                        delete draft.request.options.gasPrice
                        delete draft.request.options.maxFeePerGas
                        delete draft.request.options.maxPriorityFeePerGas
                    }
                }),
            )
        },
        [Message],
    )

    const isSignRequest = signRequest.includes(currentRequest.request.arguments.method)
    let isDangerRequest = false
    if (typeof message === 'object') {
        if (message.invalidFields.filter((x) => x !== 'chainId' && x !== 'version').length || !message.parsed)
            isDangerRequest = true
        if (origin && !origin.startsWith('https:')) isDangerRequest = true
    }
    const isUnlockERC20 = transaction.formattedTransaction?.popup?.spender
    const isUnlockERC721 = transaction.formattedTransaction?.popup?.erc721Spender
    const content =
        transaction.payload.method === EthereumMethodType.wallet_watchAsset ?
            <WatchTokenRequest transaction={transaction} />
        : isSignRequest ? <SignRequestInfo message={message} rawMessage={rawMessage} origin={requestOrigin} />
        : isUnlockERC20 ?
            <UnlockERC20Token
                onConfigChange={setGasConfig}
                paymentToken={paymentToken}
                onPaymentTokenChange={setPaymentToken}
                transaction={transaction}
                handleChange={setApproveAmount}
            />
        : isUnlockERC721 ?
            <UnlockERC721Token
                onConfigChange={setGasConfig}
                paymentToken={paymentToken}
                onPaymentTokenChange={setPaymentToken}
                transaction={transaction}
            />
        :   <TransactionPreview
                transaction={transaction}
                onConfigChange={setGasConfig}
                paymentToken={paymentToken}
                onPaymentTokenChange={setPaymentToken}
            />

    const FullTransactionDetails =
        expand ?
            <Box className={classes.transactionDetail} marginBottom={pager ? 16 : 0}>
                {transaction.formattedTransaction?.popup?.spender && approvedAmount ?
                    <>
                        <Box display="flex" alignItems="center" columnGap={1.25}>
                            <Typography className={classes.itemTitle}>
                                {t.popups_wallet_unlock_erc20_approve_amount()}
                            </Typography>
                            <Typography className={classes.itemValue}>{approvedAmount}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" columnGap={1.25}>
                            <Typography className={classes.itemTitle}>
                                {t.popups_wallet_unlock_erc20_granted_to()}
                            </Typography>
                            <Typography className={classes.itemValue}>
                                {formatEthereumAddress(transaction.formattedTransaction.popup.spender, 4)}
                            </Typography>
                        </Box>
                    </>
                :   null}
                <Box display="flex" columnGap={0.5} alignItems="center">
                    <Icons.Documents className={classes.document} size={16} />
                    <Typography className={classes.text}>{t.data()}</Typography>
                </Box>
                {transaction.formattedTransaction?.popup?.method ?
                    <Typography className={classes.text}>
                        {t.popups_wallet_transaction_function_name({
                            name: transaction.formattedTransaction.popup.method,
                        })}
                    </Typography>
                :   null}
                {transaction.formattedTransaction?._tx.data ?
                    <Typography className={classes.data}>{transaction.formattedTransaction._tx.data}</Typography>
                :   null}
            </Box>
        :   null
    const ViewFullTransactionDetailsButton =
        isSignRequest || !FullTransactionDetails ? null : (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Button variant="text" onClick={() => setExpand(!expand)}>
                    <Typography className={classes.text}>{t.popups_wallet_view_full_detail_transaction()}</Typography>
                    <Icons.ArrowDrop size={16} className={cx(classes.arrowIcon, expand ? classes.expand : undefined)} />
                </Button>
            </Box>
        )
    const CancelButton = (
        <ActionButton
            loading={cancelRunning}
            disabled={actionRunning}
            onClick={(e) => {
                if (isDangerRequest && dangerDialogOpen) setDangerDialogOpen(false)
                else onCancel(e)
            }}
            fullWidth
            variant="outlined">
            {t.cancel()}
        </ActionButton>
    )
    const actionName = isSignRequest ? t.sign() : t.confirm()
    const ConfirmButton = (
        <ActionButton
            loading={confirmRunning}
            disabled={actionRunning}
            sx={isDangerRequest ? { background: (theme) => theme.palette.maskColor.danger } : undefined}
            onClick={() => {
                if (isDangerRequest && !dangerDialogOpen) return setDangerDialogOpen(true)
                else onConfirm(paymentToken, approvedAmount, gasConfig)
            }}
            fullWidth>
            {actionName}
        </ActionButton>
    )
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false)
    const DangerDialog =
        isDangerRequest ?
            <Dialog open={dangerDialogOpen}>
                <DialogContent>
                    <DialogContentText variant="overline">
                        {t.popups_wallet_sign_in_danger_confirm_title()}
                    </DialogContentText>
                    <DialogContentText color={(theme) => theme.palette.maskColor.danger}>
                        {t.popups_wallet_sign_in_danger_confirm()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {CancelButton}
                    {ConfirmButton}
                </DialogActions>
            </Dialog>
        :   null
    return (
        <Box flex={1} display="flex" flexDirection="column">
            <Box p={2} display="flex" flexDirection="column" flex={1} maxHeight="calc(100vh - 142px)" overflow="auto">
                {content}
                {ViewFullTransactionDetailsButton}
                {FullTransactionDetails}
                {pager}
            </Box>
            {DangerDialog}
            <BottomController>
                {CancelButton}
                {ConfirmButton}
            </BottomController>
        </Box>
    )
})
InteractionItem.displayName = 'InteractionItem'

interface InteractionItemProps {
    message: ParsedSigningMessage
    rawMessage: RawSigningMessage
    requestOrigin: string | undefined
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    transaction: TransactionDetail
    pager: JSX.Element | undefined | null
    onCancel: MouseEventHandler<HTMLButtonElement>
    onConfirm: (paymentToken: string, approvedAmount: string, gasConfig: GasConfig | undefined) => void
    cancelRunning: boolean
    confirmRunning: boolean
    paymentToken: string
    setPaymentToken: (newToken: string) => void
}
function tryParseStringMessage(message: string) {
    return message.startsWith('0x') ?
            new TextDecoder().decode(
                new Uint8Array([...message.slice(2).matchAll(/([\da-f]{2})/gi)].map((i) => Number.parseInt(i[0], 16))),
            )
        :   message
}
export default InteractionFrame
