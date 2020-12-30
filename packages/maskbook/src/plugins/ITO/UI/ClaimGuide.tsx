import { createStyles, DialogContent, makeStyles, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useState, useEffect } from 'react'
import { RemindDialog } from './RemindDialog'
import { ShareDialog } from './ShareDialog'
import { ClaimDialog, ClaimDialogProps } from './ClaimDialog'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'

export enum ClaimStatus {
    Remind,
    Swap,
    Share,
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

interface ClaimGuideProps extends Pick<ClaimDialogProps, 'exchangeTokens' | 'payload' | 'revalidateAvailability'> {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function ClaimGuide(props: ClaimGuideProps) {
    const { t } = useI18N()
    const { payload, exchangeTokens, revalidateAvailability, onClose } = props
    const classes = useStyles()
    const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.Remind)
    const initAmount = new BigNumber(payload.limit).dividedBy(2)
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const chainId = useChainId()
    const account = useAccount()

    const ClaimTitle: EnumRecord<ClaimStatus, string> = {
        [ClaimStatus.Remind]: t('plugin_ito_dialog_claim_reminder_title'),
        [ClaimStatus.Swap]: t('plugin_ito_dialog_claim_swap_title', { token: payload.token.symbol }),
        [ClaimStatus.Share]: t('plugin_ito_dialog_claim_share_title'),
    }

    useEffect(() => {
        setStatus(
            chainId === payload.chain_id &&
                payload.buyers.map((val) => val.address.toLowerCase()).includes(account.toLowerCase())
                ? ClaimStatus.Share
                : ClaimStatus.Remind,
        )
    }, [account, payload.buyers, chainId, payload.chain_id])

    return (
        <InjectedDialog
            open={props.open}
            title={ClaimTitle[status]}
            onClose={props.onClose}
            DialogProps={{ maxWidth: status === ClaimStatus.Swap ? 'xs' : 'sm' }}>
            <DialogContent className={classes.content}>
                {(() => {
                    switch (status) {
                        case ClaimStatus.Remind:
                            return <RemindDialog token={payload.token} chainId={chainId} setStatus={setStatus} />
                        case ClaimStatus.Swap:
                            return (
                                <ClaimDialog
                                    account={account}
                                    initAmount={initAmount}
                                    tokenAmount={tokenAmount}
                                    setTokenAmount={setTokenAmount}
                                    payload={payload}
                                    token={payload.token}
                                    exchangeTokens={exchangeTokens}
                                    revalidateAvailability={revalidateAvailability}
                                    setStatus={setStatus}
                                    chainId={chainId}
                                />
                            )
                        case ClaimStatus.Share:
                            return <ShareDialog token={payload.token} tokenAmount={tokenAmount} onClose={onClose} />
                        default:
                            return null
                    }
                })()}
            </DialogContent>
        </InjectedDialog>
    )
}
