import { ZERO } from '@dimensiondev/maskbook-shared'
import { ERC20TokenDetailed, EthereumTokenType, useAccount, useChainId } from '@dimensiondev/web3-shared'
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
    Remind,
    Swap,
    Share,
    Unlock,
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
    isBuyer: boolean
    retryPayload: () => void
    onClose: () => void
    onUpdate: (status: SwapStatus) => void
}

export function SwapGuide(props: SwapGuideProps) {
    const { t } = useI18N()
    const { status, payload, exchangeTokens, isBuyer, open, retryPayload, shareSuccessLink, onUpdate, onClose } = props
    const [isPending, startTransition] = useTransition()
    const onCloseShareDialog = useCallback(() => {
        startTransition(() => {
            onClose()
            retryPayload()
        })
    }, [retryPayload, startTransition, onClose])
    const classes = useStyles()
    const maxSwapAmount = useMemo(
        () => BigNumber.min(payload.limit, payload.total_remaining),
        [payload.limit, payload.total_remaining],
    )
    const initAmount = ZERO
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const [actualSwapAmount, setActualSwapAmount] = useState<BigNumber.Value>(0)
    const chainId = useChainId()
    const account = useAccount()

    const SwapTitle: EnumRecord<SwapStatus, string> = {
        [SwapStatus.Remind]: t('plugin_ito_dialog_swap_reminder_title'),
        [SwapStatus.Unlock]: t('plugin_ito_dialog_swap_unlock_title'),
        [SwapStatus.Swap]: t('plugin_ito_dialog_swap_title', { token: payload.token.symbol }),
        [SwapStatus.Share]: t('plugin_ito_dialog_swap_share_title'),
    }

    useEffect(() => {
        onUpdate(isBuyer ? SwapStatus.Share : SwapStatus.Remind)
    }, [account, isBuyer, chainId, payload.chain_id])

    return (
        <InjectedDialog
            open={open}
            title={SwapTitle[status]}
            onClose={status === SwapStatus.Share ? onCloseShareDialog : onClose}
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
                                            (x) => x.type === EthereumTokenType.ERC20,
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
