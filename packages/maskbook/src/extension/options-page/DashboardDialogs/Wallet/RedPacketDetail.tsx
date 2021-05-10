import { Box, Chip, makeStyles, Theme, Typography } from '@material-ui/core'
import { useCallback } from 'react'
import { useRedPacketFromDB } from '../../../../plugins/RedPacket/hooks/useRedPacket'
import type { RedPacketJSONPayload } from '../../../../plugins/RedPacket/types'
import { RedPacket } from '../../../../plugins/RedPacket/UI/RedPacket'
import { isSameAddress } from '../../../../web3/helpers'
import { useAccount } from '../../../../web3/hooks/useAccount'
import ActionButton from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import WalletLine from '../WalletLine'
import type { WalletProps } from './types'

const useRedPacketDetailDialogStyles = makeStyles((theme: Theme) => ({
    sayThanks: {
        display: 'block',
        width: 200,
        margin: `${theme.spacing(2)}px auto`,
    },
    link: {
        display: 'block',
        width: '100%',
        wordBreak: 'break-all',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export function DashboardWalletRedPacketDetailDialog(
    props: WrappedDialogProps<WalletProps & { payload: RedPacketJSONPayload }>,
) {
    const { wallet, payload } = props.ComponentProps!

    const classes = useRedPacketDetailDialogStyles()

    const account = useAccount()
    const redPacket = useRedPacketFromDB(payload.rpid)

    const sayThanks = useCallback(() => {
        if (!redPacket?.from) return
        if (!redPacket.from!.includes('twitter.com/')) {
            window.open(redPacket.from, '_blank', 'noopener noreferrer')
        } else {
            const user = redPacket.from!.match(/(?!\/)[\d\w]+(?=\/status)/)
            const userText = user ? ` from @${user}` : ''
            const text = [
                `I just received a Red Packet${userText}. Follow @realMaskbook (mask.io) to get your first Twitter #payload.`,
                `#mask_io ${redPacket.from}`,
            ].join('\n')
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                '_blank',
                'noopener noreferrer',
            )
        }
    }, [redPacket])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary="Red Packet Detail"
                content={
                    <>
                        <RedPacket payload={payload} />
                        {redPacket?.from && !isSameAddress(redPacket.payload.sender.address, wallet.address) && (
                            <ActionButton className={classes.sayThanks} onClick={sayThanks} variant="contained">
                                Say Thanks
                            </ActionButton>
                        )}
                        {redPacket?.from && (
                            <WalletLine
                                onClick={() => window.open(redPacket?.from, '_blank', 'noopener noreferrer')}
                                line1="Source"
                                line2={
                                    <Typography className={classes.link} color="primary">
                                        {redPacket?.from || 'Unknown'}
                                    </Typography>
                                }
                            />
                        )}
                        <WalletLine
                            line1="From"
                            line2={
                                <>
                                    {payload.sender.name}{' '}
                                    {isSameAddress(payload.sender.address, account) && (
                                        <Chip label="Me" variant="outlined" color="secondary" size="small" />
                                    )}
                                </>
                            }
                        />
                        <WalletLine line1="Message" line2={payload.sender.message} />
                        <Box
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography variant="caption" color="textSecondary">
                                Created at {new Date(payload.creation_time).toLocaleString()}
                            </Typography>
                        </Box>
                    </>
                }
            />
        </DashboardDialogCore>
    )
}
