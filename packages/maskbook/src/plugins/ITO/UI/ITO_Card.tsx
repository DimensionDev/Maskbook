import { Alert, Typography, Button, Skeleton, Box, createStyles } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { EthereumMessages } from '../../Ethereum/messages'
import { formatBalance } from '../../Wallet/formatter'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useMaskITO_Packet } from '../hooks/useMaskITO_Packet'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 10,
            width: '100%',
            background: 'linear-gradient(90deg, #FE686F 0%, #F78CA0 100%);',
            marginTop: theme.spacing(2.5),
        },
        amount: {
            fontSize: 18,
            zIndex: 1,
            position: 'relative',
        },
        content: {
            boxSizing: 'border-box',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: theme.spacing(2.5),
        },
        ITOAlertContainer: {
            padding: theme.spacing(0, 2.5, 2.5, 2.5),
        },
        ITOAlert: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
        },
        button: {
            //TODO: https://github.com/mui-org/material-ui/issues/25011
            '&[disabled]': {
                opacity: 0.5,
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
        },
    }),
)

export interface ITO_CardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
    onUpdateAmount: (amount: string) => void
    onUpdateBalance: () => void
}

export function ITO_Card(props: ITO_CardProps) {
    const { token, onUpdateAmount, onUpdateBalance } = props

    const classes = useStylesExtends(useStyles(), props)
    const { value: packet, loading: packetLoading, error: packetError, retry: packetRetry } = useMaskITO_Packet()

    //#region calim
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback()
    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            [
                `I just claimed ${cashTag}${token?.symbol} with ${formatBalance(
                    new BigNumber(packet?.claimable ?? '0'),
                    18,
                    6,
                )}. Follow @realMaskbook (mask.io) to claim airdrop.`,
                '#mask_io',
                postLink,
            ].join('\n'),
        )
        .toString()

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            onUpdateBalance()
            packetRetry()
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
            summary: `Claiming ${formatBalance(new BigNumber(packet.claimable), 18, 6)} ${token?.symbol ?? 'Token'}.`,
        })
    }, [claimState /* update tx dialog only if state changed */])
    //#endregion

    //#region update parent amount
    useEffect(() => {
        if (!packet) return
        onUpdateAmount(packet.claimable)
    }, [packet, onUpdateAmount])
    //#endregion

    if (!token) return null

    if (packetLoading)
        return (
            <Box className={classes.root}>
                <Box className={classes.content} flexDirection="column">
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
                <Box className={classes.content}>
                    <Typography>{packetError.message}</Typography>
                    <ActionButton className={classes.button} variant="contained" onClick={() => packetRetry()}>
                        Retry
                    </ActionButton>
                </Box>
            </Box>
        )

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Typography>ITO locked:</Typography>
                    <Typography className={classes.amount}>
                        {packet && packet.claimable !== '0'
                            ? formatBalance(new BigNumber(packet.claimable), token.decimals, 6)
                            : '0.00'}
                    </Typography>
                </Box>
                {packet ? (
                    <Box display="flex" alignItems="center">
                        <ActionButton
                            className={classes.button}
                            variant="contained"
                            disabled={
                                Number.parseInt(packet.unlockTime) > Math.round(Date.now() / 1000) ||
                                packet.claimable === '0'
                            }
                            onClick={onClaimButtonClick}>
                            Claim
                        </ActionButton>
                    </Box>
                ) : null}
            </Box>
            {packet ? (
                <Box className={classes.ITOAlertContainer}>
                    <Alert icon={false} className={classes.ITOAlert}>
                        ITO Mask unlock time is {new Date(Number.parseInt(packet.unlockTime) * 1000).toUTCString()}.
                    </Alert>
                </Box>
            ) : null}
        </Box>
    )
}
