import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import {
    makeStyles,
    type ShowSnackbarOptions,
    type SnackbarKey,
    type SnackbarMessage,
    useCustomSnackbar,
    usePopupCustomSnackbar,
} from '@masknet/theme'
import { type NetworkPluginID, createLookupTableResolver, Sniffings } from '@masknet/shared-base'
import { TransactionStatusType, type RecognizableError } from '@masknet/web3-shared-base'
import { useWeb3State, useChainContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSharedTrans } from '../../../index.js'

const useStyles = makeStyles()({
    link: {
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
    },
})

interface TransactionSnackbarProps<T extends NetworkPluginID> {
    pluginID: T
}

export function TransactionSnackbar<T extends NetworkPluginID>({ pluginID }: TransactionSnackbarProps<T>) {
    const { classes } = useStyles()
    const t = useSharedTrans()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const { showSnackbar: showPopupSnackbar, closeSnackbar: closePopupSnackbar } = usePopupCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>(undefined)

    const { chainId } = useChainContext()
    const [errorInfo, setErrorInfo] = useState<
        | {
              error: RecognizableError
              request: JsonRpcPayload
          }
        | undefined
    >()
    const [progress, setProgress] = useState<{
        chainId: Web3Helper.Definition[T]['ChainId']
        status: TransactionStatusType
        txHash: string
        transaction: Web3Helper.Definition[T]['Transaction']
    }>()
    const Utils = useWeb3Utils(pluginID)
    const { TransactionFormatter, TransactionWatcher } = useWeb3State(pluginID)

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('error', (error, request) => {
            setErrorInfo({ error, request })
        })
        return () => {
            off?.()
        }
    }, [TransactionWatcher])

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('progress', (chainId, txHash, status, transaction) => {
            if (!transaction || !pluginID) return
            setProgress({
                chainId,
                status,
                txHash,
                transaction,
            })
        })

        return () => {
            off?.()
        }
    }, [TransactionWatcher, pluginID])

    useEffect(() => {
        setProgress(undefined)
        setErrorInfo(undefined)
    }, [chainId])

    const resolveSnackbarConfig = createLookupTableResolver<
        TransactionStatusType,
        Pick<ShowSnackbarOptions, 'message' | 'processing' | 'variant'>
    >(
        {
            [TransactionStatusType.NOT_DEPEND]: {
                processing: true,
                variant: 'default',
                message: t.plugin_wallet_snackbar_wait_for_confirming(),
            },
            [TransactionStatusType.SUCCEED]: {
                processing: false,
                variant: 'success',
                message: t.plugin_wallet_snackbar_confirmed(),
            },
            [TransactionStatusType.FAILED]: {
                processing: false,
                variant: 'error',
                message: t.plugin_wallet_snackbar_failed(),
            },
        },
        {},
    )

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined)
                Sniffings.is_popup_page ?
                    closePopupSnackbar(snackbarKeyRef.current)
                :   closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current =
                Sniffings.is_popup_page ? showPopupSnackbar(title, options) : showSnackbar(title, options)
            return () => {
                Sniffings.is_popup_page ?
                    closePopupSnackbar(snackbarKeyRef.current)
                :   closeSnackbar(snackbarKeyRef.current)
            }
        },
        [showSnackbar, closeSnackbar, showPopupSnackbar, closePopupSnackbar],
    )

    useAsync(async () => {
        if (!progress) return
        const computed = await TransactionFormatter?.formatTransaction(
            progress.chainId,
            progress.transaction,
            progress.txHash,
        )
        if (!computed || computed.title === 'followWithSig' || computed.title === 'burnWithSig') return

        showSingletonSnackbar(
            progress.status === TransactionStatusType.SUCCEED ?
                computed.snackbar?.successfulTitle ?? computed.title
            :   computed.title,
            {
                ...resolveSnackbarConfig(progress.status),
                ...{
                    message: (
                        <Link
                            sx={{ wordBreak: 'break-word' }}
                            className={classes.link}
                            color="inherit"
                            href={Utils.explorerResolver.transactionLink(progress.chainId, progress.txHash)}
                            tabIndex={-1}
                            target="_blank"
                            rel="noopener noreferrer">
                            {progress.status === TransactionStatusType.SUCCEED ?
                                computed.snackbar?.successfulDescription ?? computed.description
                            :   computed.description}{' '}
                            <Icons.LinkOut size={16} sx={{ ml: 0.5 }} />
                        </Link>
                    ),
                },
            },
        )
    }, [progress])

    useAsync(async () => {
        if (!errorInfo) return
        const transaction = errorInfo.request?.params?.[0] as Web3Helper.Definition[T]['Transaction'] | undefined
        const computed = transaction ? await TransactionFormatter?.formatTransaction?.(chainId, transaction) : undefined
        const title = computed?.snackbar?.failedTitle ?? computed?.title
        const message = errorInfo.error.isRecognized ? errorInfo.error.message : computed?.snackbar?.failedDescription

        if (!title) return

        if (
            title === 'Claim your Airdrop' &&
            (errorInfo.error.message.includes('Transaction was rejected') ||
                errorInfo.error.message.includes('Signature canceled') ||
                errorInfo.error.message.includes('User rejected the request') ||
                errorInfo.error.message.includes('User rejected transaction'))
        )
            return
        const snackbarConfig = resolveSnackbarConfig(TransactionStatusType.FAILED)

        showSingletonSnackbar(title, {
            ...snackbarConfig,
            message: message ?? snackbarConfig.message,
        })
        setErrorInfo(undefined)
    }, [JSON.stringify(errorInfo), chainId])

    return null
}
