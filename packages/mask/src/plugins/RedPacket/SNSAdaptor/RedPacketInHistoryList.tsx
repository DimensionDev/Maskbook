import { type MouseEvent, useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@react-hookz/web'
import { Box, Typography, Popper, useMediaQuery, type Theme, ListItem } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import intervalToDuration from 'date-fns/intervalToDuration'
import nextDay from 'date-fns/nextDay'
import { Translate, useI18N } from '../locales/index.js'
import { dateTimeFormat } from '../../ITO/assets/formatDate.js'
import { type RedPacketJSONPayload, type RedPacketJSONPayloadFromChain, RedPacketStatus } from '../types.js'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed.js'
import { useCreateRedPacketReceipt } from './hooks/useCreateRedPacketReceipt.js'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { useChainContext, useFungibleToken, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatBalance, type FungibleToken, minus } from '@masknet/web3-shared-base'
import { TokenIcon } from '@masknet/shared'

const useStyles = makeStyles<{ isViewed: boolean; listItemBackground?: string; listItemBackgroundIcon?: string }>()(
    (theme, { isViewed, listItemBackground, listItemBackgroundIcon }) => {
        const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
        return {
            message: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                [smallQuery]: {
                    whiteSpace: 'normal',
                },
            },
            root: {
                width: '100%',
                padding: 0,
                background: isViewed ? theme.palette.common.white : 'unset',
                marginBottom: theme.spacing(1.5),
                borderRadius: 8,
            },
            contentItem: {
                width: '100%',
                borderRadius: 8,
                position: 'static !important' as any,
                height: 'auto !important',
                padding: theme.spacing(1.5),
                background: isViewed ? listItemBackground ?? theme.palette.background.default : 'unset',
                [smallQuery]: {
                    padding: theme.spacing(2, 1.5),
                },
                '&:before': isViewed
                    ? {
                          position: 'absolute',
                          content: '""',
                          top: 45,
                          left: 400,
                          zIndex: 0,
                          width: 114,
                          opacity: 0.2,
                          height: 61,
                          filter: 'blur(1.5px)',
                          background: listItemBackgroundIcon,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '114px 114px',
                      }
                    : {},
            },
            box: {
                display: 'flex',
                width: '100%',
            },
            content: {
                transform: 'translateY(-4px)',
                width: '100%',
                [smallQuery]: {
                    paddingLeft: theme.spacing(1.5),
                    width: 'auto',
                },
            },
            section: {
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
                [smallQuery]: {
                    flexWrap: 'wrap',
                },
            },
            div: {
                maxWidth: 350,
            },
            title: {
                color: theme.palette.maskColor.dark,
                fontWeight: 700,
                fontSize: 14,
            },
            info: {
                color: theme.palette.maskColor.dark,
                [smallQuery]: {
                    fontSize: 13,
                },
                fontSize: 14,
            },
            infoTitle: {
                color: theme.palette.maskColor.secondaryDark,
                marginRight: 4,
                fontSize: 14,
                [smallQuery]: {
                    fontSize: 13,
                },
            },
            actionButton: {
                fontSize: 12,
                width: 88,
                height: 32,
                background: theme.palette.maskColor.dark,
                color: theme.palette.maskColor.white,
                borderRadius: '999px',
                minHeight: 'auto',
                [smallQuery]: {
                    marginTop: theme.spacing(1),
                },
                '&:disabled': {
                    background: theme.palette.maskColor.dark,
                    color: theme.palette.common.white,
                },
                '&:hover': {
                    background: theme.palette.maskColor.dark,
                    color: theme.palette.maskColor.white,
                    opacity: 0.8,
                },
            },
            footer: {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                marginTop: 15,
            },
            footerInfo: {
                fontSize: 14,
                color: theme.palette.maskColor.secondaryDark,
                '& span': {
                    color: theme.palette.maskColor.dark,
                    marginRight: 2,
                },
            },
            popper: {
                overflow: 'visible',
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff',
                transform: 'translate(196px, 47px)',
                borderRadius: 8,
                width: 328,
                padding: 10,
            },
            arrow: {
                position: 'absolute',
                top: -12,
                right: 40,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `6px solid ${theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff'}`,
                transform: 'translateY(6px)',
            },
            popperText: {
                cursor: 'default',
                color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
                fontSize: 12,
            },
            disabledButton: {
                background: theme.palette.maskColor.dark,
                color: theme.palette.common.white,
                opacity: 0.6,
            },
            fullWidthBox: {
                width: '100%',
                display: 'flex',
            },
            icon: {
                width: 18,
                height: 18,
                marginLeft: 6,
                zIndex: -1,
            },
        }
    },
)

export interface RedPacketInHistoryListProps {
    history: RedPacketJSONPayload | RedPacketJSONPayloadFromChain
    onSelect: (payload: RedPacketJSONPayload) => void
}
export function RedPacketInHistoryList(props: RedPacketInHistoryListProps) {
    const { history, onSelect } = props
    const t = useI18N()
    const [isViewed, setIsViewed] = useState(false)

    const ref = useRef<HTMLLIElement | null>(null)
    const entry = useIntersectionObserver(ref, {})
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const { value: receipt } = useCreateRedPacketReceipt(isViewed ? history.txid : '')
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)

    const rpid = receipt?.rpid ?? ''
    const creation_time = receipt?.creation_time ?? 0

    const { classes, cx } = useStyles({
        isViewed: isViewed && !!rpid,
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    const patchedHistory: RedPacketJSONPayload | RedPacketJSONPayloadFromChain = useMemo(
        () => ({ ...props.history, rpid, creation_time }),
        [props.history, rpid, creation_time],
    )

    useEffect(() => {
        if (entry?.isIntersecting) setIsViewed(true)
    }, [entry?.isIntersecting])

    const {
        value: availability,
        computed: { canRefund, canSend, listOfStatus, isPasswordValid },
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, patchedHistory)

    const claimerNumber = availability ? Number(availability.claimed) : 0
    const total_remaining = availability?.balance

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(
        patchedHistory.contract_version,
        account,
        rpid,
    )
    const tokenAddress =
        (patchedHistory as RedPacketJSONPayload).token?.address ??
        (patchedHistory as RedPacketJSONPayloadFromChain).token_address

    const { value: tokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress ?? '', undefined, {
        chainId,
    })

    const historyToken = {
        ...(tokenDetailed ?? (patchedHistory as RedPacketJSONPayload).token),
        address: tokenAddress,
    } as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>

    const onSendOrRefund = useCallback(async () => {
        if (canRefund) {
            await refundCallback()
            revalidateAvailability()
        }
        if (canSend) onSelect({ ...patchedHistory, token: historyToken })
    }, [onSelect, refundCallback, canRefund, canSend, patchedHistory, historyToken])

    // #region password lost tips
    const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)
    const openPopper = !!anchorEl
    // #endregion

    // #region refund time
    const refundDuration =
        canSend && !isPasswordValid ? intervalToDuration({ start: Date.now(), end: nextDay(creation_time, 1) }) : null
    const formatRefundDuration = `${refundDuration?.hours}h ${refundDuration?.minutes}m`
    // #endregion

    return (
        <ListItem className={classes.root}>
            <section className={classes.contentItem} ref={ref}>
                {!rpid ? null : (
                    <Box className={classes.box}>
                        <Box className={classes.content}>
                            <section className={classes.section}>
                                <div className={classes.div}>
                                    <div className={classes.fullWidthBox}>
                                        <Typography variant="body1" className={cx(classes.title, classes.message)}>
                                            {patchedHistory.sender.message === ''
                                                ? t.best_wishes()
                                                : patchedHistory.sender.message}
                                        </Typography>
                                    </div>
                                    <div className={classes.fullWidthBox}>
                                        <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                            {t.create_time()}
                                        </Typography>
                                        <Typography variant="body1" className={cx(classes.info, classes.message)}>
                                            {t.history_duration({ time: dateTimeFormat(new Date(creation_time)) })}
                                        </Typography>
                                    </div>
                                </div>
                                {canRefund || canSend || listOfStatus.includes(RedPacketStatus.empty) || refunded ? (
                                    <>
                                        <ActionButton
                                            loading={isRefunding}
                                            fullWidth={isSmall}
                                            onClick={canSend && !isPasswordValid ? undefined : onSendOrRefund}
                                            onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => {
                                                canSend && !isPasswordValid
                                                    ? setAnchorEl(event.currentTarget)
                                                    : undefined
                                            }}
                                            onMouseLeave={() => {
                                                canSend && !isPasswordValid ? setAnchorEl(null) : undefined
                                            }}
                                            disabled={
                                                listOfStatus.includes(RedPacketStatus.empty) || refunded || isRefunding
                                            }
                                            className={cx(
                                                classes.actionButton,
                                                canSend && !isPasswordValid ? classes.disabledButton : '',
                                            )}
                                            size="large">
                                            {canSend
                                                ? t.share()
                                                : isRefunding
                                                ? t.refunding()
                                                : listOfStatus.includes(RedPacketStatus.empty) || refunded
                                                ? t.empty()
                                                : t.refund()}
                                        </ActionButton>
                                        <Popper
                                            className={classes.popper}
                                            id="popper"
                                            open={openPopper}
                                            anchorEl={anchorEl}
                                            transition
                                            disablePortal>
                                            <Typography className={classes.popperText}>
                                                {t.data_broken({ duration: formatRefundDuration })}
                                            </Typography>
                                            <div className={classes.arrow} />
                                        </Popper>
                                    </>
                                ) : null}
                            </section>

                            <section className={classes.footer}>
                                <Typography variant="body1" className={classes.footerInfo}>
                                    <Translate.history_claimed
                                        components={{
                                            span: <span />,
                                        }}
                                        values={{
                                            claimedShares: String(claimerNumber),
                                            shares: String(patchedHistory.shares),
                                            amount: formatBalance(
                                                patchedHistory.total,
                                                historyToken?.decimals,
                                                6,
                                                true,
                                            ),
                                            claimedAmount: formatBalance(
                                                minus(patchedHistory.total, total_remaining ?? 0),
                                                historyToken?.decimals,
                                                6,
                                                true,
                                            ),
                                            symbol: historyToken?.symbol,
                                        }}
                                    />
                                </Typography>
                                <TokenIcon
                                    className={classes.icon}
                                    address={historyToken?.address ?? ''}
                                    name={historyToken?.name}
                                    logoURL={historyToken?.logoURL}
                                />
                            </section>
                        </Box>
                    </Box>
                )}
            </section>
        </ListItem>
    )
}
