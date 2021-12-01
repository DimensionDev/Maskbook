import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import type { TransactionReceipt } from 'web3-core'
import {
    createLookupTableResolver,
    resolveTransactionLinkOnExplorer,
    TransactionState,
    TransactionStateType,
    useChainId,
} from '@masknet/web3-shared-evm'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { WalletMessages } from '../../messages'
import { RecentTransactionDescription } from '../WalletStatusDialog/TransactionDescription'
import Services from '../../../../extension/service'

export const resolveSnackbarConfig = createLookupTableResolver<
    TransactionStateType,
    Pick<ShowSnackbarOptions, 'message' | 'processing' | 'variant'>
>(
    {
        [TransactionStateType.WAIT_FOR_CONFIRMING]: {
            processing: true,
            variant: 'default',
            message: 'Confirm this transaction in your wallet',
        },
        [TransactionStateType.HASH]: {
            processing: true,
            variant: 'default',
            message: 'Transaction Submitted',
        },
        [TransactionStateType.CONFIRMED]: {
            processing: false,
            variant: 'success',
            message: 'Transaction Confirmed',
        },
        [TransactionStateType.RECEIPT]: {
            processing: false,
            variant: 'success',
            message: 'Transaction Confirmed',
        },
        [TransactionStateType.FAILED]: {
            processing: false,
            variant: 'error',
            message: 'Transaction Failed',
        },
        [TransactionStateType.UNKNOWN]: {
            processing: false,
            variant: 'error',
            message: '',
        },
    },
    {},
)

const useStyles = makeStyles()({
    link: {
        display: 'flex',
        alignItems: 'center',
    },
})

export function TransactionSnackbar() {
    const chainId = useChainId()
    const { classes } = useStyles()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()

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

    const getTitle = useCallback((state: TransactionState, payload: any, hash?: string) => {
        return (
            <RecentTransactionDescription
                hash={hash ?? ''}
                computedPayload={payload}
                receipt={(state as { receipt: TransactionReceipt }).receipt}
            />
        )
    }, [])

    const getFullMessage = useCallback(
        (message: ReactNode, hash?: string) => {
            if (!hash) return message
            const link = resolveTransactionLinkOnExplorer(chainId, hash)
            return (
                <Link className={classes.link} color="inherit" href={link} target="_blank" rel="noopener noreferrer">
                    {message} <LaunchIcon sx={{ ml: 1 }} fontSize="inherit" />
                </Link>
            )
        },
        [chainId],
    )

    useEffect(() => {
        return WalletMessages.events.transactionProgressUpdated.on(async (progress) => {
            if (location.href.includes('popups.html')) return
            if (progress.state.type === TransactionStateType.UNKNOWN) return

            const payload = await Services.Ethereum.getSendTransactionComputedPayload(progress.payload)
            const config = resolveSnackbarConfig(progress.state.type)
            const hash =
                (progress.state as { hash?: string }).hash ??
                (progress.state as { receipt?: TransactionReceipt }).receipt?.transactionHash

            if (
                ['swapExactETHForTokens', 'swapExactTokensForETH', 'swapExactTokensForTokens'].includes(
                    payload?.name ?? '',
                )
            ) {
                if (progress.state.type === TransactionStateType.CONFIRMED) {
                    showSingletonSnackbar('Successfully swapped Token', {
                        ...config,
                        ...{ message: getFullMessage(getTitle(progress.state, payload, hash), hash) },
                    })
                    return
                }

                if (progress.state.type === TransactionStateType.FAILED) {
                    showSingletonSnackbar('Swap Token', {
                        ...config,
                        ...{ message: getFullMessage('Transaction rejected', hash) },
                    })
                    return
                }
            }

            showSingletonSnackbar(getTitle(progress.state, payload, hash), {
                ...config,
                ...{ message: getFullMessage(config.message, hash) },
            } as ShowSnackbarOptions)
        })
    }, [getTitle, getFullMessage])

    return null
}
