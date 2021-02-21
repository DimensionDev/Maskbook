import { Box, Button, createStyles, makeStyles, Skeleton, Typography } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import BigNumber from 'bignumber.js'
import { useState, useCallback, useEffect } from 'react'
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
import { CheckStateType, useCheckCallback } from '../hooks/useCheckCallback'
import { ClaimDialog } from './ClaimDialog'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2.5),
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
        button: {
            background: 'rgba(255, 255, 255, .2)',
        },
    }),
)

export interface AirdropClaimCardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
    onUpdateAmount: (amount: string) => void
}

export function AirdropClaimCard(props: AirdropClaimCardProps) {
    const { token, onUpdateAmount } = props
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const { value: packet, error: packetError, loading: packetLoading, retry: packetRetry } = useAirdropPacket(account)

    //#region check
    const [checkState, checkCallback, resetCheckCallback] = useCheckCallback()
    useEffect(() => {
        checkCallback(account)
    }, [account])
    //#endregion

    //#region claim callback
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(packet)
    const onClaimButtonClick = useCallback(() => {
        setClaimDialogOpen(true)
    }, [])
    //#endregion

    //#region claim dialog
    const [claimDialogOpen, setClaimDialogOpen] = useState(false)
    const onClaimDialogClaim = useCallback(() => {
        setClaimDialogOpen(false)
        claimCallback()
    }, [claimCallback])
    const onClaimDialogClose = useCallback(() => {
        setClaimDialogOpen(false)
    }, [])
    //#endregion

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
            shareLink,
            state: claimState,
            summary: `Claiming ${formatBalance(new BigNumber(packet.amount), 18, 6)} ${token?.symbol}.`,
        })
    }, [claimState /* update tx dialog only if state changed */])
    //#endregion

    //#region update parent amount
    useEffect(() => {
        if (!token) return
        if (checkState.type === CheckStateType.YEP)
            onUpdateAmount(
                new BigNumber(checkState.claimable).multipliedBy(new BigNumber(10).pow(token.decimals)).toFixed(),
            )
    }, [checkState, token, onUpdateAmount])
    //#endregion

    // no token found
    if (!token) return null

    if (packetLoading)
        return (
            <Box className={classes.root}>
                <Box>
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        height={25}
                        width="80%"
                        style={{ marginBottom: 8 }}></Skeleton>
                    <Skeleton animation="wave" variant="rectangular" height={28} width="40%"></Skeleton>
                </Box>
            </Box>
        )

    if (packetError)
        return (
            <Box className={classes.root} display="flex" justifyContent="center">
                <Typography>{packetError.message}</Typography>
                <Button className={classes.button} onClick={() => packetRetry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <>
            <Box className={classes.root} display="flex" justifyContent="space-between">
                <Box display="flex">
                    <AirdropIcon classes={{ root: classes.icon }} />
                    <Box>
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Airdrop</span>
                            <span
                                title="Airdrop MASK, 20% reduction every 24 hours. Airdrop unlock time is 02/26/2021 03:00 AM (UTC+0)."
                                style={{ lineHeight: 0.8, cursor: 'pointer' }}>
                                <InfoIcon fontSize="small" sx={{ marginLeft: 0.2 }} />
                            </span>
                        </Typography>
                        <Typography className={classes.amount} sx={{ marginTop: 1.5 }}>
                            {checkState.type === CheckStateType.YEP ? `${checkState.claimable}.00` : '0.00'}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex">
                    {checkState.type === CheckStateType.YEP ? (
                        <Typography>Current Ratio: {formatPercentage(checkState.ratio)}</Typography>
                    ) : null}
                    {packet ? (
                        <Box display="flex" alignItems="center" marginLeft={2.5}>
                            <Button
                                className={classes.button}
                                variant="contained"
                                disabled
                                onClick={onClaimButtonClick}>
                                Claim
                            </Button>
                        </Box>
                    ) : null}
                </Box>
            </Box>
            {packet ? (
                <ClaimDialog
                    open={claimDialogOpen}
                    amount={packet.amount}
                    token={token}
                    onClaim={onClaimDialogClaim}
                    onClose={onClaimDialogClose}
                />
            ) : null}
        </>
    )
}
