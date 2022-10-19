import { useCallback, useEffect, useRef, useState } from 'react'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { useAsync } from 'react-use'
import { Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import { TransactionStatusType, RecognizedError } from '@masknet/web3-shared-base'
import { useWeb3State, useChainId } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../../../../utils/index.js'

const useStyles = makeStyles()({
    link: {
        display: 'flex',
        alignItems: 'center',
    },
})
export interface TransactionSnackbarProps<T extends NetworkPluginID> {
    pluginID: T
}
export function TransactionSnackbar<T extends NetworkPluginID>({ pluginID }: TransactionSnackbarProps<T>) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()

    const chainId = useChainId(pluginID)
    const [errorInfo, setErrorInfo] = useState<
        | {
              error: RecognizedError
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
    const { Others, TransactionFormatter, TransactionWatcher } = useWeb3State(pluginID)

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('error', (error, request) => {
            setErrorInfo({ error, request })
        })
        return () => {
            off?.()
        }
    }, [TransactionWatcher])

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('progress', (txHash, status, transaction) => {
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
    }, [TransactionWatcher, chainId, pluginID])

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
                message: t('plugin_wallet_snackbar_wait_for_confirming'),
            },
            [TransactionStatusType.SUCCEED]: {
                processing: false,
                variant: 'success',
                message: t('plugin_wallet_snackbar_confirmed'),
            },
            [TransactionStatusType.FAILED]: {
                processing: false,
                variant: 'error',
                message: t('plugin_wallet_snackbar_failed'),
            },
        },
        {},
    )

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined) closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current = showSnackbar(title, options)
            return () => {
                closeSnackbar(snackbarKeyRef.current)
            }
        },
        [showSnackbar, closeSnackbar],
    )

    useAsync(async () => {
        if (!progress) return
        const computed = await TransactionFormatter?.formatTransaction?.(
            progress.chainId,
            progress.transaction,
            progress.txHash,
        )
        if (!computed) return

        showSingletonSnackbar(computed.title, {
            ...resolveSnackbarConfig(progress.status),
            ...{
                message: (
                    <Link
                        className={classes.link}
                        color="inherit"
                        href={Others?.explorerResolver.transactionLink?.(progress.chainId, progress.txHash)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {progress.status === TransactionStatusType.SUCCEED
                            ? computed.snackbar?.successfulDescription ?? computed.description
                            : computed.description}{' '}
                        <Icons.LinkOut size={16} sx={{ ml: 0.5 }} />
                    </Link>
                ),
            },
        })
    }, [progress])

    useAsync(async () => {
        const transaction = errorInfo?.request?.params?.[0] as Web3Helper.Definition[T]['Transaction'] | undefined
        const computed = transaction ? await TransactionFormatter?.formatTransaction?.(chainId, transaction) : undefined
        const title = computed?.title
        const message = errorInfo?.error.isRecognized ? errorInfo?.error.message : computed?.snackbar?.failedDescription

        if (!title) return

        const snackbarConfig = resolveSnackbarConfig(TransactionStatusType.FAILED)

        showSingletonSnackbar(title, {
            ...snackbarConfig,
            message: message ?? snackbarConfig.message,
        })
        setErrorInfo(undefined)
    }, [JSON.stringify(errorInfo), chainId])

    return null
}
