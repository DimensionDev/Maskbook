import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import { createLookupTableResolver, NetworkPluginID, TransactionStatusType } from '@masknet/web3-shared-base'
import { useWeb3State, Web3Helper, useRecentTransactions, useChainId } from '@masknet/plugin-infra/web3'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { isPopupPage } from '@masknet/shared-base'
import type { TransactionProgressEvent } from '@masknet/plugin-wallet'
import { WalletMessages } from '../../messages'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()({
    link: {
        display: 'flex',
        alignItems: 'center',
    },
})
export interface TransactionSnackbarProps {
    pluginID?: NetworkPluginID
}
export function TransactionSnackbar({ pluginID }: TransactionSnackbarProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()

    const chainId = useChainId(pluginID)
    const [progress, setProgress] = useState<TransactionProgressEvent>()
    const { Others, TransactionFormatter, TransactionWatcher } = useWeb3State(
        progress?.pluginID,
    ) as Web3Helper.Web3StateAll
    const pendingTransactions = useRecentTransactions(pluginID)

    useEffect(() => {
        const removeListener = TransactionWatcher?.emitter.on('progress', (id, status) => {
            const transaction = pendingTransactions.find((x) => Object.keys(x.candidates).includes(id))
            if (!transaction || !pluginID) return
            setProgress({
                chainId,
                pluginID,
                status,
                transactionId: id,
                transaction,
            })
        })

        return () => {
            removeListener?.()
        }
    }, [pendingTransactions, TransactionWatcher, NetworkPluginID, chainId, pluginID])

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

    useEffect(() =>
        WalletMessages.events.transactionProgressUpdated.on((progress) => {
            // disable transaction snackbar on popup page
            if (!isPopupPage()) setProgress(progress)
        }),
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
                        href={Others?.explorerResolver.transactionLink?.(progress.chainId, progress.transactionId)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {computed.description} <LaunchIcon sx={{ ml: 1 }} fontSize="inherit" />
                    </Link>
                ),
            },
        } as ShowSnackbarOptions)
    }, [progress])

    return null
}
