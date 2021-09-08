import { Box, ClickAwayListener, Skeleton, Tooltip, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Info as InfoIcon } from '@material-ui/icons'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { AirdropIcon } from '../../../resources/AirdropIcon'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import {
    ERC20TokenDetailed,
    formatPercentage,
    isZero,
    pow10,
    TransactionStateType,
    useAccount,
    useChainId,
} from '@masknet/web3-shared'
import { WalletMessages } from '../../Wallet/messages'
import { useAirdropPacket } from '../hooks/useAirdropPacket'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { CheckStateType, useCheckCallback } from '../hooks/useCheckCallback'
import { ClaimDialog } from './ClaimDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2.5),
        color: '#fff',
        fontSize: 14,
        position: 'relative',
    },
    title: {
        zIndex: 1,
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
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        //TODO: https://github.com/mui-org/material-ui/issues/25011
        '&[disabled]': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.5,
        },
    },
    tooltipPopover: {
        // Just meet design
        width: 330,
    },
    tooltip: {
        // Because disablePortal, the tooltip placement can't effect
        marginTop: theme.spacing(-11),
    },
}))

export interface AirdropClaimCardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
    onUpdateAmount: (amount: string) => void
    onUpdateBalance: () => void
}

export function AirdropClaimCard(props: AirdropClaimCardProps) {
    const { token, onUpdateAmount, onUpdateBalance } = props
    const [showTooltip, setShowTooltip] = useState(false)
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const { value: packet, error: packetError, loading: packetLoading, retry: packetRetry } = useAirdropPacket(account)

    //#region check
    const [checkState, checkCallback, resetCheckCallback] = useCheckCallback()
    useEffect(() => {
        checkCallback(account)
    }, [account, chainId, checkCallback])
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
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            [
                `I just claimed ${cashTag}${token?.symbol} with ${
                    new BigNumber(packet?.amount ?? '0')
                        .multipliedBy(checkState.type === CheckStateType.YEP ? checkState.ratio : 1)
                        .dp(0)
                        .toFixed() + '.00'
                }. Follow @realMaskNetwork (mask.io) to claim airdrop.`,
                postLink,
            ].join('\n'),
        )
        .toString()

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            onUpdateBalance()
            checkCallback(account)
            resetClaimCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (checkState.type !== CheckStateType.YEP) return
        if (claimState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: claimState,
            summary: `Claiming ${checkState.claimable}.00 ${token?.symbol ?? 'Token'}.`,
        })
    }, [claimState /* update tx dialog only if state changed */])
    //#endregion

    //#region update parent amount
    useEffect(() => {
        if (!token) return
        onUpdateAmount(
            new BigNumber(
                checkState.type === CheckStateType.YEP || checkState.type === CheckStateType.NOPE
                    ? checkState.claimable
                    : 0,
            )
                .multipliedBy(pow10(token.decimals))
                .toFixed(),
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
                        style={{ marginBottom: 8 }}
                    />
                    <Skeleton animation="wave" variant="rectangular" height={28} width="40%" />
                </Box>
            </Box>
        )

    if (packetError)
        return (
            <Box className={classes.root} display="flex" justifyContent="space-between">
                <Typography>{packetError.message}</Typography>
                <ActionButton className={classes.button} variant="contained" onClick={() => packetRetry()}>
                    Retry
                </ActionButton>
            </Box>
        )

    return (
        <>
            <Box className={classes.root} display="flex" justifyContent="space-between">
                <Box display="flex">
                    <AirdropIcon classes={{ root: classes.icon }} />
                    <Box>
                        <Typography className={classes.title} sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ lineHeight: 1.5 }}>Airdrop</span>
                            {checkState.type === CheckStateType.YEP || checkState.type === CheckStateType.NOPE ? (
                                <ClickAwayListener onClickAway={() => setShowTooltip(false)}>
                                    <div>
                                        <Tooltip
                                            placement="top-end"
                                            PopperProps={{
                                                disablePortal: true,
                                            }}
                                            open={showTooltip}
                                            onClose={() => setShowTooltip(false)}
                                            classes={{ popper: classes.tooltipPopover, tooltip: classes.tooltip }}
                                            disableHoverListener
                                            disableTouchListener
                                            title={`Airdrop MASK, 20% reduction every 24 hours. Airdrop starts at ${new Date(
                                                checkState.start,
                                            ).toUTCString()} and ends at ${new Date(checkState.end).toUTCString()}.`}
                                            style={{ lineHeight: 0.8, cursor: 'pointer', marginLeft: 2 }}>
                                            <InfoIcon fontSize="small" onClick={(e) => setShowTooltip(true)} />
                                        </Tooltip>
                                    </div>
                                </ClickAwayListener>
                            ) : null}
                        </Typography>
                        <Typography className={classes.amount} sx={{ marginTop: 1.5 }}>
                            {checkState.type === CheckStateType.YEP || checkState.type === CheckStateType.NOPE
                                ? `${checkState.claimable}.00`
                                : '0.00'}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex">
                    <Box marginLeft={2.5}>
                        {checkState.type === CheckStateType.YEP ? (
                            <Typography>Current Ratio: {formatPercentage(checkState.ratio)}</Typography>
                        ) : null}
                        <Box display="flex" alignItems="center" justifyContent="flex-end" marginTop={1.5}>
                            <ActionButton
                                className={classes.button}
                                variant="contained"
                                disabled={checkState.type !== CheckStateType.YEP || isZero(checkState.claimable)}
                                onClick={onClaimButtonClick}>
                                Claim
                            </ActionButton>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {checkState.type === CheckStateType.YEP ? (
                <ClaimDialog
                    open={claimDialogOpen}
                    amount={checkState.claimable}
                    token={token}
                    onClaim={onClaimDialogClaim}
                    onClose={onClaimDialogClose}
                />
            ) : null}
        </>
    )
}
