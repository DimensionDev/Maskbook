import {
    ERC20TokenDetailed,
    useAccount,
    useChainId,
    ZERO,
    isSameAddress,
    useTokenConstants,
} from '@masknet/web3-shared'
import { DialogContent, makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { RemindDialog } from './RemindDialog'
import { ShareDialog } from './ShareDialog'
import { SwapDialog, SwapDialogProps } from './SwapDialog'
import { UnlockDialog } from './UnlockDialog'

export enum SwapStatus {
    Remind = 0,
    Swap = 1,
    Share = 2,
    Unlock = 3,
}

const useStyles = makeStyles((theme) => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2, 3),
    },
}))

interface SwapGuideProps
    extends Pick<SwapDialogProps, 'exchangeTokens' | 'payload'>,
        Omit<InjectedDialogProps, 'onClose'> {
    status: SwapStatus
    shareSuccessLink: string | undefined
    total_remaining: BigNumber
    isBuyer: boolean
    retryPayload: () => void
    onClose: () => void
    onUpdate: (status: SwapStatus) => void
}

export function SwapGuide(props: SwapGuideProps) {
    const { t } = useI18N()
    const {
        status,
        payload,
        exchangeTokens,
        isBuyer,
        open,
        retryPayload,
        shareSuccessLink,
        total_remaining,
        onUpdate,
        onClose,
    } = props
    const [isPending, startTransition] = useTransition()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const onCloseShareDialog = useCallback(() => {
        startTransition(() => {
            onClose()
            retryPayload()
        })
    }, [retryPayload, startTransition, onClose])
    const classes = useStyles()
    const maxSwapAmount = useMemo(() => BigNumber.min(payload.limit, total_remaining), [payload.limit, total_remaining])
    const initAmount = ZERO
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const [actualSwapAmount, setActualSwapAmount] = useState<BigNumber.Value>(0)
    const chainId = useChainId()
    const account = useAccount()

    const SwapTitle: Record<SwapStatus, string> = {
        [SwapStatus.Remind]: t('plugin_ito_dialog_swap_reminder_title'),
        [SwapStatus.Unlock]: t('plugin_ito_dialog_swap_unlock_title'),
        [SwapStatus.Swap]: t('plugin_ito_dialog_swap_title', { token: payload.token.symbol }),
        [SwapStatus.Share]: t('plugin_ito_dialog_swap_share_title'),
    }

    const closeDialog = useCallback(() => {
        setTokenAmount(initAmount)
        return status === SwapStatus.Share ? onCloseShareDialog() : onClose()
    }, [status, initAmount, onCloseShareDialog, onClose, setTokenAmount])

    useEffect(() => {
        onUpdate(isBuyer ? SwapStatus.Share : SwapStatus.Remind)
    }, [account, isBuyer, chainId, payload.chain_id])

    return (
        <InjectedDialog
            open={open}
            title={SwapTitle[status]}
            onClose={closeDialog}
            maxWidth={SwapStatus.Swap || status === SwapStatus.Unlock ? 'xs' : 'sm'}>
            <DialogContent className={classes.content}>
                {(() => {
                    switch (status) {
                        case SwapStatus.Remind:
                            return <RemindDialog token={payload.token} chainId={chainId} setStatus={onUpdate} />
                        case SwapStatus.Unlock:
                            return (
                                <UnlockDialog
                                    tokens={
                                        payload.exchange_tokens.filter(
                                            (x) => !isSameAddress(NATIVE_TOKEN_ADDRESS, x.address),
                                        ) as ERC20TokenDetailed[]
                                    }
                                />
                            )
                        case SwapStatus.Swap:
                            return (
                                <SwapDialog
                                    account={account}
                                    initAmount={initAmount}
                                    tokenAmount={tokenAmount}
                                    maxSwapAmount={maxSwapAmount}
                                    setTokenAmount={setTokenAmount}
                                    setActualSwapAmount={setActualSwapAmount}
                                    payload={payload}
                                    token={payload.token}
                                    exchangeTokens={exchangeTokens}
                                    setStatus={onUpdate}
                                    chainId={chainId}
                                />
                            )
                        case SwapStatus.Share:
                            return (
                                <ShareDialog
                                    shareSuccessLink={shareSuccessLink}
                                    poolName={payload.message}
                                    token={payload.token}
                                    actualSwapAmount={actualSwapAmount}
                                    onClose={onCloseShareDialog}
                                />
                            )
                        default:
                            return null
                    }
                })()}
            </DialogContent>
        </InjectedDialog>
    )
}
