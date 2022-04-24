import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { TransactionStatusType, useWeb3State } from '@masknet/plugin-infra/web3'
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

export function TransactionSnackbar() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()

    const [progress, setProgress] = useState<TransactionProgressEvent<number, unknown>>()
    const { Utils, TransactionFormatter } = useWeb3State(progress?.pluginID)

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
            [TransactionStatusType.CANCELLED]: {
                processing: false,
                variant: 'success',
                message: 'plugin_wallet_snackbar_canceled',
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
                        href={Utils?.resolveTransactionLink?.(progress.chainId, progress.transactionId)}
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
