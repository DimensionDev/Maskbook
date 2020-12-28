import { createStyles, DialogContent, makeStyles, Box, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useState } from 'react'
import { getSupportTokenInfo } from './ITO'
import { RemindDialog } from './RemindDialog'
import { ShareDialog } from './ShareDialog'
import { ClaimDialog, ClaimDialogProps } from './ClaimDialog'

export enum ClaimStatus {
    Remind,
    Swap,
    Share,
}

const useStyles = makeStyles(() =>
    createStyles({
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '95%',
            margin: '0 auto',
            paddingBottom: '1rem',
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
    const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.Share)

    const initAmount = new BigNumber(payload.limit).dividedBy(2)
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)

    const chainId = useChainId()
    if (!payload) return null
    const { tokenIconListTable } = getSupportTokenInfo(chainId)
    const CurrentTokenIcon = tokenIconListTable[payload.token.address]
    const ClaimTitle: EnumRecord<ClaimStatus, string> = {
        [ClaimStatus.Remind]: t('plugin_ito_dialog_claim_reminder_title'),
        [ClaimStatus.Swap]: t('plugin_ito_dialog_claim_swap_title', { token: payload.token.symbol }),
        [ClaimStatus.Share]: t('plugin_ito_dialog_claim_share_title'),
    }

    return (
        <InjectedDialog open={props.open} title={ClaimTitle[status]} onClose={props.onClose}>
            <DialogContent>
                <Box className={classes.wrapper}>
                    {(() => {
                        switch (status) {
                            case ClaimStatus.Remind:
                                return (
                                    <RemindDialog
                                        CurrentTokenIcon={CurrentTokenIcon}
                                        token={payload.token}
                                        chainId={chainId}
                                        setStatus={setStatus}
                                    />
                                )
                            case ClaimStatus.Swap:
                                return (
                                    <ClaimDialog
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
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
