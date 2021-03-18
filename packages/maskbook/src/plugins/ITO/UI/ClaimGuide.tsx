import { unstable_useTransition } from 'react'
import { createStyles, DialogContent, makeStyles, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { RemindDialog } from './RemindDialog'
import { ShareDialog } from './ShareDialog'
import { ClaimDialog, ClaimDialogProps } from './ClaimDialog'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { UnlockDialog } from './UnlockDialog'
import { ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'

export enum ClaimStatus {
    Remind,
    Swap,
    Share,
    Unlock,
}

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(2, 3),
        },
    }),
)

interface ClaimGuideProps extends Pick<ClaimDialogProps, 'exchangeTokens' | 'payload'> {
    open: boolean
    status: ClaimStatus
    shareSuccessLink: string | undefined
    isBuyer: boolean
    retryPayload: () => void
    onUpdate: (status: ClaimStatus) => void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function ClaimGuide(props: ClaimGuideProps) {
    const { t } = useI18N()
    const { status, payload, exchangeTokens, isBuyer, open, retryPayload, shareSuccessLink, onUpdate, onClose } = props
    const [startTransition] = unstable_useTransition({ busyDelayMs: 1000 })
    const onCloseShareDialog = useCallback(() => {
        startTransition(() => {
            onClose()
            retryPayload()
        })
    }, [retryPayload, startTransition, onClose])
    const classes = useStyles()
    const maxSwapAmount = useMemo(
        () => BigNumber.min(new BigNumber(payload.limit), new BigNumber(payload.total_remaining)),
        [payload.limit, payload.total_remaining],
    )
    const initAmount = new BigNumber(0)
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const [actualSwapAmount, setActualSwapAmount] = useState<BigNumber>(new BigNumber(0))
    const chainId = useChainId()
    const account = useAccount()

    const ClaimTitle: EnumRecord<ClaimStatus, string> = {
        [ClaimStatus.Remind]: t('plugin_ito_dialog_claim_reminder_title'),
        [ClaimStatus.Unlock]: t('plugin_ito_dialog_claim_unlock_title'),
        [ClaimStatus.Swap]: t('plugin_ito_dialog_claim_swap_title', { token: payload.token.symbol }),
        [ClaimStatus.Share]: t('plugin_ito_dialog_claim_share_title'),
    }

    useEffect(() => {
        onUpdate(isBuyer ? ClaimStatus.Share : ClaimStatus.Remind)
    }, [account, isBuyer, chainId, payload.chain_id])

    return (
        <InjectedDialog
            open={open}
            title={ClaimTitle[status]}
            onClose={status === ClaimStatus.Share ? onCloseShareDialog : onClose}
            DialogProps={{ maxWidth: status === ClaimStatus.Swap || status === ClaimStatus.Unlock ? 'xs' : 'sm' }}>
            <DialogContent className={classes.content}>
                {(() => {
                    switch (status) {
                        case ClaimStatus.Remind:
                            return (
                                <RemindDialog
                                    isMask={payload.is_mask ?? false}
                                    token={payload.token}
                                    chainId={chainId}
                                    setStatus={onUpdate}
                                />
                            )
                        case ClaimStatus.Unlock:
                            return (
                                <UnlockDialog
                                    isMask={payload.is_mask ?? false}
                                    tokens={
                                        payload.exchange_tokens.filter(
                                            (x) => x.type === EthereumTokenType.ERC20,
                                        ) as ERC20TokenDetailed[]
                                    }
                                />
                            )
                        case ClaimStatus.Swap:
                            return (
                                <ClaimDialog
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
                        case ClaimStatus.Share:
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
