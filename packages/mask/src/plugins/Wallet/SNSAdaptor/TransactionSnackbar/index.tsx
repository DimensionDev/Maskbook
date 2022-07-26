import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { Link } from '@mui/material'
import { LinkOutIcon } from '@masknet/icons'
import { createLookupTableResolver, NetworkPluginID, TransactionStatusType } from '@masknet/web3-shared-base'
import { useWeb3State, useChainId, Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../../../../utils'

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
    const [error, setError] = useState<Error | undefined>()
    const [progress, setProgress] = useState<{
        chainId: Web3Helper.Definition[T]['ChainId']
        status: TransactionStatusType
        id: string
        transaction: Web3Helper.Definition[T]['Transaction']
    }>()
    const { Others, TransactionFormatter, TransactionWatcher } = useWeb3State(pluginID)

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('error', (error) => {
            setError(error)
        })
        return () => {
            off?.()
        }
    }, [TransactionWatcher])

    useEffect(() => {
        const off = TransactionWatcher?.emitter.on('progress', (id, status, transaction) => {
            if (!transaction || !pluginID) return
            setProgress({
                chainId,
                status,
                id,
                transaction,
            })
        })

        return () => {
            off?.()
        }
    }, [TransactionWatcher, chainId, pluginID])

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

        const computed = await TransactionFormatter?.formatTransaction?.(progress.chainId, progress.transaction)
        if (!computed) return

        showSingletonSnackbar(computed.title, {
            ...resolveSnackbarConfig(progress.status),
            ...{
                message: (
                    <Link
                        className={classes.link}
                        color="inherit"
                        href={Others?.explorerResolver.transactionLink?.(progress.chainId, progress.id)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {progress.status === TransactionStatusType.SUCCEED
                            ? computed.successfulDescription ?? computed.description
                            : computed.description}{' '}
                        <LinkOutIcon sx={{ ml: 0.5, width: '16px', height: '16px' }} />
                    </Link>
                ),
            },
        })
    }, [progress])

    useAsync(async () => {
        if (!error?.message) return

        console.log({
            error,
        })

        showSingletonSnackbar(error.message, {
            ...resolveSnackbarConfig(TransactionStatusType.FAILED),
        })
    }, [error?.message])

    return null
}
