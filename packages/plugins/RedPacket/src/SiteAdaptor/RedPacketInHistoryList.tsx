import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleToken, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import {
    RedPacketStatus,
    type RedPacketJSONPayload,
    type RedPacketJSONPayloadFromChain,
} from '@masknet/web3-providers/types'
import { formatBalance, minus, type FungibleToken } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography, useMediaQuery, type Theme } from '@mui/material'
import { intervalToDuration, nextDay } from 'date-fns'
import { memo, useCallback, useMemo } from 'react'
import { useEverSeen } from '../../../../shared-base-ui/src/hooks/useEverSeen.js'
import { RedPacketTrans, useRedPacketTrans } from '../locales/index.js'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed.js'
import { useCreateRedPacketReceipt } from './hooks/useCreateRedPacketReceipt.js'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { dateTimeFormat } from './utils/formatDate.js'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string }>()((
    theme,
    { listItemBackground, listItemBackgroundIcon },
) => {
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
            background: theme.palette.common.white,
            marginBottom: theme.spacing(1.5),
            borderRadius: 8,
            '&:last-child': {
                marginBottom: '80px',
            },
        },
        contentItem: {
            width: '100%',
            borderRadius: 8,
            position: 'static !important' as any,
            height: 'auto !important',
            padding: theme.spacing(1.5),
            background: listItemBackground ?? theme.palette.background.default,
            [smallQuery]: {
                padding: theme.spacing(2, 1.5),
            },
            '&:before': {
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
            },
        },
        box: {
            display: 'flex',
            width: '100%',
        },
        content: {
            transform: 'RedPacketTransY(-4px)',
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
        popperText: {
            cursor: 'default',
            color: theme.palette.common.white,
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
        invisible: {
            visibility: 'hidden',
        },
    }
})

interface RedPacketInHistoryListProps {
    history: RedPacketJSONPayload | RedPacketJSONPayloadFromChain
    onSelect: (payload: RedPacketJSONPayload) => void
}
export const RedPacketInHistoryList = memo(function RedPacketInHistoryList(props: RedPacketInHistoryListProps) {
    const { history, onSelect } = props
    const t = useRedPacketTrans()

    const [seen, ref] = useEverSeen()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const { data: receipt } = useCreateRedPacketReceipt(seen && !history.rpid ? history.txid : '')
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)

    const rpid = history.rpid || receipt?.rpid || ''
    const creation_time = history.creation_time || receipt?.creation_time || 0

    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    const patchedHistory: RedPacketJSONPayload | RedPacketJSONPayloadFromChain = useMemo(
        () => ({ ...props.history, rpid, creation_time }),
        [props.history, rpid, creation_time],
    )

    const {
        value: availability,
        computed: { canRefund, canSend, listOfStatus, isPasswordValid },
        password,
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

    const { data: tokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress ?? '', undefined, {
        chainId,
    })

    const historyToken = useMemo(() => {
        return {
            ...(tokenDetailed ?? (patchedHistory as RedPacketJSONPayload).token),
            address: tokenAddress,
        } as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    }, [tokenDetailed, patchedHistory, tokenAddress])

    const onSendOrRefund = useCallback(async () => {
        if (canRefund) {
            await refundCallback()
            revalidateAvailability()
        }
        if (canSend) onSelect({ ...patchedHistory, password, token: historyToken })
    }, [onSelect, refundCallback, canRefund, canSend, patchedHistory, historyToken, password])

    // #region refund time
    const refundDuration =
        canSend && !isPasswordValid ? intervalToDuration({ start: Date.now(), end: nextDay(creation_time, 1) }) : null
    const formatRefundDuration = `${refundDuration?.hours}h ${refundDuration?.minutes}m`
    // #endregion

    return (
        <ListItem className={classes.root}>
            <section className={classes.contentItem} ref={ref}>
                <Box className={classes.box}>
                    <Box className={classes.content}>
                        <section className={classes.section}>
                            <div className={classes.div}>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.title, classes.message)}>
                                        {patchedHistory.sender.message === '' ?
                                            t.best_wishes()
                                        :   patchedHistory.sender.message}
                                    </Typography>
                                </div>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                        {t.create_time()}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className={cx(classes.info, classes.message, rpid ? '' : classes.invisible)}>
                                        {t.history_duration({ time: dateTimeFormat(new Date(creation_time)) })}
                                    </Typography>
                                </div>
                            </div>
                            {canRefund || canSend || listOfStatus.includes(RedPacketStatus.empty) || refunded ?
                                <ShadowRootTooltip
                                    placement="top"
                                    title={
                                        canSend && !isPasswordValid ?
                                            <Typography className={classes.popperText}>
                                                {t.data_broken({ duration: formatRefundDuration })}
                                            </Typography>
                                        :   undefined
                                    }>
                                    <span style={{ display: 'inline-block' }}>
                                        <ActionButton
                                            loading={isRefunding}
                                            fullWidth={isSmall}
                                            onClick={canSend && !isPasswordValid ? undefined : onSendOrRefund}
                                            disabled={
                                                listOfStatus.includes(RedPacketStatus.empty) || refunded || isRefunding
                                            }
                                            className={cx(
                                                classes.actionButton,
                                                canSend && !isPasswordValid ? classes.disabledButton : '',
                                            )}
                                            size="large">
                                            {canSend ?
                                                t.share()
                                            : isRefunding ?
                                                t.refunding()
                                            : listOfStatus.includes(RedPacketStatus.empty) || refunded ?
                                                t.empty()
                                            :   t.refund()}
                                        </ActionButton>
                                    </span>
                                </ShadowRootTooltip>
                            :   null}
                        </section>

                        <section className={classes.footer}>
                            <Typography variant="body1" className={classes.footerInfo}>
                                <RedPacketTrans.history_claimed
                                    components={{
                                        span: <span />,
                                    }}
                                    values={{
                                        claimedShares: String(claimerNumber),
                                        shares: String(patchedHistory.shares),
                                        amount: formatBalance(patchedHistory.total, historyToken.decimals ?? 18, {
                                            significant: 6,
                                            isPrecise: true,
                                        }),
                                        claimedAmount:
                                            rpid ?
                                                formatBalance(
                                                    minus(patchedHistory.total, total_remaining ?? 0),
                                                    historyToken.decimals,
                                                    { significant: 6, isPrecise: true },
                                                )
                                            :   '',
                                        symbol: historyToken.symbol,
                                    }}
                                />
                            </Typography>
                            {historyToken.logoURL ?
                                <TokenIcon
                                    className={classes.icon}
                                    address={historyToken.address}
                                    name={historyToken.name}
                                    logoURL={historyToken.logoURL}
                                />
                            :   null}
                        </section>
                    </Box>
                </Box>
            </section>
        </ListItem>
    )
})
