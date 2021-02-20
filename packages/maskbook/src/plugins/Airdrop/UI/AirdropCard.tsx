import { Box, Button, createStyles, makeStyles, OutlinedInput, Typography } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { AirdropIcon } from '../../../resources/AirdropIcon'
import { getActivatedUI } from '../../../social-network/ui'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { EthereumMessages } from '../../Ethereum/messages'
import { formatBalance, formatPercentage } from '../../Wallet/formatter'
import { useAirdropPacket } from '../hooks/useAirdropPacket'
import { useClaimCallback } from '../hooks/useClaimCallback'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            background: 'linear-gradient(90deg, #2174F6 0%, #00C6FB 100%)',
            borderRadius: 10,
            width: '100%',
        },
        content: {
            borderBottom: '1px dashed rgba(255,255,255, 0.5)',
            padding: theme.spacing(2.5),
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            fontSize: 14,
            position: 'relative',
        },
        amount: {
            fontSize: 18,
            zIndex: 1,
            position: 'relative',
        },
        icon: {
            width: 70,
            height: 79,
            position: 'absolute',
            left: '17%',
            top: 5,
        },
        checkAddress: {
            padding: theme.spacing(2.5),
            fontSize: 13,
            color: '#fff',
        },
        checkAddressInput: {
            flex: 1,
            height: 48,
            color: '#fff',
            '& > fieldset': {
                borderColor: '#F3F3F4',
            },
        },
        button: {
            background: 'rgba(255, 255, 255, .2)',
        },
    }),
)

export interface AirdropCardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
    totalVolume: string
}

export function AirdropCard(props: AirdropCardProps) {
    const { token, totalVolume } = props
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const { value: packet, error: packetError, loading: packetLoading } = useAirdropPacket(account)

    // console.log({
    //     token,
    //     packet,
    //     packetError,
    //     packetLoading,
    // })

    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(packet)
    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])

    //#region transaction dialog
    const cashTag = getActivatedUI()?.networkIdentifier === 'twitter.com' ? '$' : ''
    const postLink = usePostLink()
    const shareLink = useShareLink(
        [
            `I just claimed ${cashTag}${token?.symbol} with ${formatBalance(
                new BigNumber(packet?.amount ?? '0'),
                18,
                6,
            )}. Follow @realMaskbook (mask.io) to claim airdrop.`,
            '#mask_io',
            postLink,
        ].join('\n'),
    )

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            resetClaimCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!packet) return
        if (claimState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: claimState,
            summary: `Claiming ${formatBalance(new BigNumber(packet.amount), 18, 6)} ${token?.symbol}.`,
        })
    }, [claimState /* update tx dialog only if state changed */])
    //#endregion

    // no token found
    if (!token) return null

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Box display="flex">
                    <AirdropIcon classes={{ root: classes.icon }} />
                    <Box>
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Airdrop</span>
                            <InfoIcon fontSize="small" sx={{ marginLeft: 0.2 }} />
                        </Typography>
                        <Typography className={classes.amount} sx={{ marginTop: 1.5 }}>
                            {packet ? formatBalance(new BigNumber(packet.amount), 18, 2) : '0.0'}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex">
                    {packet ? (
                        <Typography>
                            Current ratio: {formatPercentage(new BigNumber(packet.amount).dividedBy(totalVolume))}
                        </Typography>
                    ) : null}
                    {packet ? (
                        <Box display="flex" alignItems="center" marginLeft={2.5}>
                            <Button variant="contained" className={classes.button} onClick={onClaimButtonClick}>
                                Claim
                            </Button>
                        </Box>
                    ) : null}
                </Box>
            </Box>
            <Box className={classes.checkAddress}>
                <Typography>Check Address</Typography>
                <Box sx={{ marginTop: 1.2, display: 'flex' }}>
                    <OutlinedInput classes={{ root: classes.checkAddressInput }} />
                    <Box marginLeft={2.5} paddingY={0.5}>
                        <Button variant="contained" className={classes.button}>
                            Check
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
