import React, { useCallback, useEffect, useRef } from 'react'
import {
    resolveTransactionLinkOnExplorer,
    TransactionState,
    TransactionStateType,
    useChainId,
} from '@masknet/web3-shared-evm'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { WalletMessages } from '../../messages'
import { getSendTransactionComputedPayload } from '../../../../extension/background-script/EthereumService'
import { RecentTransactionDescription } from '../WalletStatusDialog/TransactionDescription'
import { Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import type { TransactionReceipt } from 'web3-core'

const CONFIG_MAPPING = {
    [TransactionStateType.WAIT_FOR_CONFIRMING]: {
        processing: true,
        variant: 'success',
        message: 'Confirm this transaction in your wallet',
    },
    [TransactionStateType.HASH]: {
        processing: true,
        variant: 'success',
        message: 'Transaction Submitted',
    },
    [TransactionStateType.CONFIRMED]: {
        processing: false,
        variant: 'success',
        message: 'Transaction Successfully',
    },
    [TransactionStateType.RECEIPT]: {
        processing: false,
        variant: 'error',
        message: 'Transaction rejected',
    },
    [TransactionStateType.FAILED]: {
        processing: false,
        variant: 'error',
        message: 'Transaction rejected',
    },
}

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
        (message: string, hash?: string) => {
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
            if (progress.state.type === TransactionStateType.UNKNOWN) return

            const payload = await getSendTransactionComputedPayload(progress.payload)
            const config = CONFIG_MAPPING[progress.state.type]
            const hash =
                (progress.state as { hash?: string }).hash ??
                (progress.state as { receipt?: TransactionReceipt }).receipt?.transactionHash

            showSingletonSnackbar(getTitle(progress.state, payload, hash), {
                ...config,
                ...{ message: getFullMessage(config.message, hash) },
            } as ShowSnackbarOptions)
        })
    }, [])

    return null
}
