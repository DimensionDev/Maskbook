import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import type { TransactionReceipt } from 'web3-core'
import {
    createLookupTableResolver,
    getPayloadConfig,
    resolveTransactionLinkOnExplorer,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'
import { makeStyles, ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { WalletMessages } from '../../messages'
import { RecentTransactionDescription } from '../WalletStatusDialog/TransactionDescription'
import { useI18N } from '../../../../utils'
import { EVM_RPC } from '@masknet/plugin-evm/src/messages'

const useStyles = makeStyles()({
    link: {
        display: 'flex',
        alignItems: 'center',
    },
})

export function TransactionSnackbar() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { classes } = useStyles()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const { t } = useI18N()
    const snackbarKeyRef = useRef<SnackbarKey>()
    const resolveSnackbarConfig = createLookupTableResolver<
        TransactionStateType,
        Pick<ShowSnackbarOptions, 'message' | 'processing' | 'variant'>
    >(
        {
            [TransactionStateType.WAIT_FOR_CONFIRMING]: {
                processing: true,
                variant: 'default',
                message: t('plugin_wallet_snackbar_wait_for_confirming'),
            },
            [TransactionStateType.HASH]: {
                processing: true,
                variant: 'default',
                message: t('plugin_wallet_snackbar_hash'),
            },
            [TransactionStateType.CONFIRMED]: {
                processing: false,
                variant: 'success',
                message: t('plugin_wallet_snackbar_confirmed'),
            },
            [TransactionStateType.RECEIPT]: {
                processing: false,
                variant: 'success',
                message: t('plugin_wallet_snackbar_success'),
            },
            [TransactionStateType.FAILED]: {
                processing: false,
                variant: 'error',
                message: t('plugin_wallet_snackbar_failed'),
            },
            [TransactionStateType.UNKNOWN]: {
                processing: false,
                variant: 'error',
                message: '',
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

    const getTitle = useCallback((payload: any, hash?: string) => {
        return <RecentTransactionDescription hash={hash ?? ''} computedPayload={payload} />
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

            const payload = await EVM_RPC.getSendTransactionComputedPayload(getPayloadConfig(progress.payload))
            const config = resolveSnackbarConfig(progress.state.type)
            const hash =
                (progress.state as { hash?: string }).hash ??
                (progress.state as { receipt?: TransactionReceipt }).receipt?.transactionHash

            const transactionComputedPayloadName = (payload && 'name' in payload && payload.name) || ''
            if (
                ['swapExactETHForTokens', 'swapExactTokensForETH', 'swapExactTokensForTokens'].includes(
                    transactionComputedPayloadName,
                )
            ) {
                if (progress.state.type === TransactionStateType.CONFIRMED) {
                    showSingletonSnackbar(t('plugin_wallet_snackbar_swap_successful'), {
                        ...config,
                        ...{ message: getFullMessage(getTitle(payload, hash), hash) },
                    })
                    return
                }

                if (progress.state.type === TransactionStateType.FAILED) {
                    showSingletonSnackbar(t('plugin_wallet_snackbar_swap_token'), {
                        ...config,
                        ...{ message: getFullMessage('Transaction failed', hash) },
                    })
                    return
                }
            }

            showSingletonSnackbar(getTitle(payload, hash), {
                ...config,
                ...{ message: getFullMessage(config.message, hash) },
            } as ShowSnackbarOptions)
        })
    }, [getTitle, getFullMessage])

    return null
}
