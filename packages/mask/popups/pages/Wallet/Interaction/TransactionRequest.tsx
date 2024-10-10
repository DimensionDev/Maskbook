import { compact, mapValues, omit } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { type TransactionDetail } from '../type.js'
import { UnlockERC20Token } from '../../../components/UnlockERC20Token/index.js'
import { UnlockERC721Token } from '../../../components/UnlockERC721Token/index.js'
import { TransactionPreview } from '../../../components/TransactionPreview/index.js'
import { useCallback, useEffect, useState } from 'react'
import {
    createJsonRpcPayload,
    formatEthereumAddress,
    PayloadEditor,
    abiCoder,
    type GasConfig,
    ChainId,
    ErrorEditor,
} from '@masknet/web3-shared-evm'
import { produce } from 'immer'
import { GasOptionType, TransactionDescriptorType } from '@masknet/web3-shared-base'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useLatest } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { Box, Button, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { InteractionItemProps } from './interaction.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
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

export function TransactionRequest(props: InteractionItemProps) {
    const { currentRequest: request, setConfirmAction, paymentToken, setPaymentToken } = props
    const { classes, cx } = useStyles()
    const [gasConfig, _setGasConfig] = useState<GasConfig | undefined>()
    const [approvedAmount, setApproveAmount] = useState('')
    const { Message, TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    let transaction: TransactionDetail
    {
        const client = useQueryClient()
        const queryKey = ['popup', 'wallet', 'interaction', request.ID, chainId]
        ;({ data: transaction } = useSuspenseQuery({
            queryKey,
            networkMode: 'always',
            queryFn: async (): Promise<TransactionDetail> => {
                const payload = createJsonRpcPayload(0, request.request.arguments)
                const computedPayload = PayloadEditor.fromPayload(payload).config
                const formattedTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
                const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)

                return {
                    ...request.request.options,
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

    // update default payment token from transaction
    if (!paymentToken && transaction.paymentToken) {
        setPaymentToken(transaction.paymentToken)
    }

    setConfirmAction(async () => {
        let params = structuredClone(request.request.arguments.params)
        if (approvedAmount) {
            if (!transaction.formattedTransaction?._tx.data) return

            const parameters = abiCoder.decodeParameters(
                approveParametersType,
                transaction.formattedTransaction._tx.data.slice(10),
            )

            const parametersString = abiCoder
                .encodeParameters(approveParametersType, [parameters.spender, web3_utils.toHex(approvedAmount)])
                .slice(2)

            const result = `${transaction.formattedTransaction._tx.data.slice(0, 10)}${parametersString}`

            params = compact(
                request.request.arguments.params.map((x) =>
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

        const response = await Message!.approveAndSendRequest(request.ID, {
            arguments: {
                ...request.request.arguments,
                params,
            },
            options: {
                ...request.request.options,
                paymentToken,
            },
        })
        const editor = response ? ErrorEditor.from(null, response) : undefined
        if (editor?.presence) throw editor.error
    })

    const setGasConfig = useCallback(
        (gasConfig: GasConfig) => {
            _setGasConfig(gasConfig)
            Message?.updateMessage(
                request.ID,
                produce(request, (draft) => {
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

    const isUnlockERC20 = transaction.formattedTransaction?.popup?.spender
    const isUnlockERC721 = transaction.formattedTransaction?.popup?.erc721Spender

    const [expand, setExpand] = useState(
        transaction.formattedTransaction?.type === TransactionDescriptorType.DEPLOYMENT,
    )
    const FullTransactionDetails =
        expand ?
            <Box className={classes.transactionDetail} marginBottom={16}>
                {transaction.formattedTransaction?.popup?.spender && approvedAmount ?
                    <>
                        <Box display="flex" alignItems="center" columnGap={1.25}>
                            <Typography className={classes.itemTitle}>
                                <Trans>Approve amount</Trans>
                            </Typography>
                            <Typography className={classes.itemValue}>{approvedAmount}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" columnGap={1.25}>
                            <Trans>
                                <Typography className={classes.itemTitle}>Granted to </Typography>
                                <Typography className={classes.itemValue}>
                                    {formatEthereumAddress(transaction.formattedTransaction.popup.spender, 4)}
                                </Typography>
                            </Trans>
                        </Box>
                    </>
                :   null}
                <Box display="flex" columnGap={0.5} alignItems="center">
                    <Icons.Documents className={classes.document} size={16} />
                    <Typography className={classes.text}>
                        <Trans>Data</Trans>
                    </Typography>
                </Box>
                {transaction.formattedTransaction?.popup?.method ?
                    <Typography className={classes.text}>
                        <Trans>Function: {transaction.formattedTransaction.popup.method}</Trans>
                    </Typography>
                :   null}
                {transaction.formattedTransaction?._tx.data ?
                    <Typography className={classes.data}>{transaction.formattedTransaction._tx.data}</Typography>
                :   null}
            </Box>
        :   null
    const ViewFullTransactionDetailsButton =
        !FullTransactionDetails ? null : (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Button variant="text" onClick={() => setExpand(!expand)}>
                    <Typography className={classes.text}>
                        <Trans>View full transaction details</Trans>
                    </Typography>
                    <Icons.ArrowDrop size={16} className={cx(classes.arrowIcon, expand ? classes.expand : undefined)} />
                </Button>
            </Box>
        )

    const main =
        isUnlockERC20 ?
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
    return (
        <>
            {main}
            {ViewFullTransactionDetailsButton}
            {FullTransactionDetails}
        </>
    )
}
