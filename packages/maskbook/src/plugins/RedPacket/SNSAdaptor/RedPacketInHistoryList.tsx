import { useState, useCallback, useEffect, MouseEvent } from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Box, ListItem, Typography, Popper } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { RedPacketHistory, RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { formatBalance, TransactionStateType, useAccount } from '@masknet/web3-shared'
import { TokenIcon } from '@masknet/shared'
import { dateTimeFormat } from '../../ITO/assets/formatDate'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { StyledLinearProgress } from '../../ITO/SNSAdaptor/StyledLinearProgress'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed'
import { useRefundCallback } from './hooks/useRefundCallback'
import { WalletMessages } from '../../Wallet/messages'
import intervalToDuration from 'date-fns/intervalToDuration'

const useStyles = makeStyles()((theme) => ({
    primary: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    secondary: {
        fontSize: 12,
    },
    message: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    strong: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    span: {
        maxWidth: 350,
        display: 'inline-flex',
    },
    time: {
        fontSize: 12,
        color: theme.palette.text.secondary,
    },
    root: {
        borderRadius: 10,
        border: `solid 1px ${theme.palette.divider}`,
        marginBottom: theme.spacing(1.5),
        position: 'static !important' as any,
        height: 'auto !important',
        padding: theme.spacing(2),
    },
    box: {
        display: 'flex',
        width: '100%',
    },
    content: {
        transform: 'translateY(-4px)',
        width: '100%',
        padding: theme.spacing(0, '1rem'),
    },
    section: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    div: {},
    icon: {
        width: 27,
        height: 27,
    },
    title: {
        whiteSpace: 'break-spaces',
        fontWeight: 500,
        fontSize: 16,
    },
    info: {
        fontSize: 14,
        color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
    },
    actionButton: {
        height: 26,
        minHeight: 'auto',
    },
    footer: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2),
    },
    footerInfo: {
        fontSize: 15,
        color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
        '& strong': {
            color: theme.palette.text.primary,
        },
    },
    popper: {
        overflow: 'visible',
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff',
        transform: 'translate(183px, -32px)',
        borderRadius: 8,
        width: 328,
        padding: 10,
    },
    arrow: {
        position: 'absolute',
        bottom: 0,
        right: 80,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `6px solid ${theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff'}`,
        transform: 'translateY(6px)',
    },
    popperText: {
        cursor: 'default',
        color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
        fontSize: 12,
    },
    disabledButton: {
        color: 'rgba(255, 255, 255, 0.3)',
        boxShadow: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        cursor: 'default',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: 'rgba(255, 255, 255, 0.3)',
        },
    },
}))

export interface RedPacketInHistoryListProps {
    history: RedPacketHistory
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose: () => void
}
export function RedPacketInHistoryList(props: RedPacketInHistoryListProps) {
    const account = useAccount()
    const { history, onSelect, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const {
        value: availability,
        computed: { canRefund, canSend, listOfStatus, isPasswordValid },
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, history.payload)

    const [refundState, refundCallback, resetRefundCallback] = useRefundCallback(
        history.payload.contract_version,
        account,
        history.rpid,
    )

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => undefined,
    )

    useEffect(() => {
        if (refundState.type === TransactionStateType.UNKNOWN || !availability) return
        if (refundState.type === TransactionStateType.HASH) {
            setTransactionDialogOpen({
                open: true,
                state: refundState,
                summary: availability
                    ? `Refunding red packet for ${formatBalance(
                          new BigNumber(availability.balance),
                          history.token.decimals ?? 0,
                          history.token.decimals ?? 0,
                      )} ${history.token.symbol}`
                    : '',
            })
        } else if (refundState.type === TransactionStateType.CONFIRMED) {
            resetRefundCallback()
            revalidateAvailability()
        }
    }, [refundState /* update tx dialog only if state changed */])
    //#endregion

    const onSendOrRefund = useCallback(async () => {
        if (canRefund) await refundCallback()
        if (canSend) onSelect(history.payload)
    }, [onSelect, onClose, refundCallback, canRefund, canSend, history])

    //#region password lost tips
    const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)
    const openPopper = Boolean(anchorEl)
    //#endregion

    //#region refund time
    const refundDuration =
        canSend && !isPasswordValid
            ? intervalToDuration({ start: Date.now(), end: history.payload.creation_time + 3600 * 24 * 1000 })
            : null
    const formatedRefundDuration = `${refundDuration?.hours}h ${refundDuration?.minutes}m`
    //#endregion

    return (
        <ListItem className={classes.root}>
            <Box className={classes.box}>
                <TokenIcon
                    classes={{ icon: classes.icon }}
                    address={history.token.address}
                    name={history.token.name}
                    logoURI={history.token.logoURI}
                />
                <Box className={classes.content}>
                    <section className={classes.section}>
                        <div className={classes.div}>
                            <Typography variant="body1" className={classNames(classes.title, classes.message)}>
                                {history.message === '' ? t('plugin_red_packet_best_wishes') : history.message}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_duration', {
                                    startTime: dateTimeFormat(new Date(history.creation_time * 1000)),
                                    endTime: dateTimeFormat(
                                        new Date((history.creation_time + history.duration) * 1000),
                                        false,
                                    ),
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_total_amount', {
                                    amount: formatBalance(history.total, history.token.decimals, 6),
                                    symbol: history.token.symbol,
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t('plugin_red_packet_history_split_mode', {
                                    mode: history.is_random
                                        ? t('plugin_red_packet_random')
                                        : t('plugin_red_packet_average'),
                                })}
                            </Typography>
                        </div>
                        {canRefund ||
                        canSend ||
                        listOfStatus.includes(RedPacketStatus.empty) ||
                        refundState.type === TransactionStateType.HASH ? (
                            <>
                                <ActionButton
                                    onClick={canSend && !isPasswordValid ? () => undefined : onSendOrRefund}
                                    onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => {
                                        canSend && !isPasswordValid ? setAnchorEl(event.currentTarget) : undefined
                                    }}
                                    onMouseLeave={(_event: MouseEvent<HTMLButtonElement>) => {
                                        canSend && !isPasswordValid ? setAnchorEl(null) : undefined
                                    }}
                                    disabled={
                                        listOfStatus.includes(RedPacketStatus.empty) ||
                                        refundState.type === TransactionStateType.HASH
                                    }
                                    className={classNames(
                                        classes.actionButton,
                                        canSend && !isPasswordValid ? classes.disabledButton : '',
                                    )}
                                    variant="contained"
                                    size="large">
                                    {canSend
                                        ? t('plugin_red_packet_history_send')
                                        : refundState.type === TransactionStateType.HASH
                                        ? t('plugin_red_packet_refunding')
                                        : listOfStatus.includes(RedPacketStatus.empty)
                                        ? t('plugin_red_packet_empty')
                                        : t('plugin_red_packet_refund')}
                                </ActionButton>
                                <Popper
                                    className={classes.popper}
                                    id="popper"
                                    open={openPopper}
                                    anchorEl={anchorEl}
                                    transition
                                    disablePortal>
                                    <Typography className={classes.popperText}>
                                        {t('plugin_red_packet_data_broken', { duration: formatedRefundDuration })}
                                    </Typography>
                                    <div className={classes.arrow} />
                                </Popper>
                            </>
                        ) : null}
                    </section>
                    <StyledLinearProgress
                        barColor="rgba(44, 164, 239)"
                        backgroundColor="rgba(44, 164, 239, 0.2)"
                        variant="determinate"
                        value={100 * (1 - Number(history.total_remaining) / Number(history.total))}
                    />
                    <section className={classes.footer}>
                        <Typography variant="body1" className={classes.footerInfo}>
                            <Trans
                                i18nKey="plugin_red_packet_history_claimed"
                                components={{
                                    strong: <strong />,
                                }}
                                values={{
                                    claimedShares: history.claimers.length,
                                    shares: history.shares,
                                }}
                            />
                        </Typography>
                        <Typography variant="body1" className={classes.footerInfo}>
                            <Trans
                                i18nKey="plugin_red_packet_history_total_claimed_amount"
                                components={{
                                    strong: <strong className={classes.strong} />,
                                    span: <span className={classes.span} />,
                                }}
                                values={{
                                    amount: formatBalance(history.total, history.token.decimals, 6),
                                    claimedAmount: formatBalance(
                                        new BigNumber(history.total).minus(history.total_remaining),
                                        history.token.decimals,
                                        6,
                                    ),
                                    symbol: history.token.symbol,
                                }}
                            />
                        </Typography>
                    </section>
                </Box>
            </Box>
        </ListItem>
    )
}
