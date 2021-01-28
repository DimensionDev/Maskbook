import { Component, useCallback, useState, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles, Card, Typography, Box, Link } from '@material-ui/core'
import { BigNumber } from 'bignumber.js'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages } from '../../Wallet/messages'
import { ITO_Status } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { StyledLinearProgress } from './StyledLinearProgress'
import { formatAmountPrecision, formatBalance } from '../../Wallet/formatter'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatDateTime } from '../../../utils/date'
import { ClaimGuide } from './ClaimGuide'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { sortTokens } from '../helpers'
import { ITO_EXCHANGE_RATION_MAX } from '../constants'
import { usePoolTradeInfo } from '../hooks/usePoolTradeInfo'
import { useDestructCallback } from '../hooks/useDestructCallback'
import { getAssetAsBlobURL } from '../../../utils/suspends/getAssetAsBlobURL'
import { EthereumMessages } from '../../Ethereum/messages'
import { resolveChainName } from '../../../web3/pipes'
import { usePoolPayload } from '../hooks/usePoolPayload'

export interface IconProps {
    size?: number
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'relative',
            color: theme.palette.common.white,
            flexDirection: 'column',
            height: 385,
            boxSizing: 'border-box',
            backgroundAttachment: 'local',
            backgroundPosition: '0 0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            borderRadius: theme.spacing(1),
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(2),
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: 470,
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: 4,
        },
        status: {
            background: 'rgba(20, 23, 26, 0.6)',
            padding: '5px 16px',
            borderRadius: 10,
        },
        totalText: {
            display: 'flex',
            alignItems: 'center',
        },
        tokenLink: {
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
        },
        tokenIcon: {
            width: 24,
            height: 24,
        },
        totalIcon: {
            marginLeft: theme.spacing(1),
            cursor: 'pointer',
        },
        progressWrap: {
            width: 220,
            marginBottom: theme.spacing(3),
            marginTop: theme.spacing(1),
        },
        footer: {
            position: 'absolute',
            width: '90%',
            maxWidth: 470,
            bottom: theme.spacing(2),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        fromText: {
            opacity: 0.6,
            transform: 'translateY(5px)',
        },
        rationWrap: {
            marginBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > span': {
                marginLeft: theme.spacing(1),
                fontSize: 14,
                '& > b': {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            },
        },
        actionFooter: {
            marginTop: theme.spacing(1),
        },
        actionButton: {
            minHeight: 'auto',
            width: '100%',
        },
        textProviderErr: {
            color: '#EB5757',
            marginTop: theme.spacing(1),
        },
        loadingITO: {
            marginTop: 260,
            textAlign: 'center',
            fontSize: 24,
        },
        loadingITO_Button: {
            color: '#fff',
            borderColor: '#fff !important',
            margin: theme.spacing(1, 'auto'),
            minHeight: 35,
            '&:hover': {
                background: 'none',
            },
        },
        loadingWrap: {
            display: 'flex',
            justifyContent: 'center',
        },
    }),
)

export interface ITO_Props {
    pid: string
}

interface TokenItemProps {
    price: string
    token: EtherTokenDetailed | ERC20TokenDetailed
    exchangeToken: EtherTokenDetailed | ERC20TokenDetailed
}

const TokenItem = ({ price, token, exchangeToken }: TokenItemProps) => {
    const classes = useStyles()
    return (
        <>
            <TokenIcon classes={{ icon: classes.tokenIcon }} address={exchangeToken.address} />
            <Typography component="span">
                <strong>{price}</strong> {exchangeToken.symbol} / {token.symbol}
            </Typography>
        </>
    )
}

export function ITO(props: ITO_Props) {
    // context
    const account = useAccount()
    const postLink = usePostLink()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const [destructState, destructCallback, resetDestructCallback] = useDestructCallback()
    const [openClaimDialog, setOpenClaimDialog] = useState(false)

    // assets
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-background.jpg', import.meta.url))

    const { pid } = props
    const payload = usePoolPayload(pid)

    const {
        token,
        total: payload_total,
        seller,
        total_remaining: payload_total_remaining,
        exchange_amounts,
        exchange_tokens,
        limit,
        start_time,
        end_time,
    } = payload
    const classes = useStyles()
    const { t } = useI18N()

    const total = new BigNumber(payload_total)
    const total_remaining = new BigNumber(payload_total_remaining)
    const sold = total.minus(total_remaining)

    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        loading: loadingAvailability,
        retry: retryAvailability,
    } = useAvailabilityComputed(payload)
    //#ednregion

    const { listOfStatus } = availabilityComputed

    const isAccountSeller =
        payload.seller.address.toLowerCase() === account.toLowerCase() && chainId === payload.chain_id
    const noRemain = total_remaining.isZero()

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region buy info
    const { value: tradeInfo, loading: loadingTradeInfo, retry: retryPoolTradeInfo } = usePoolTradeInfo(pid, account)
    const isBuyer =
        chainId === payload.chain_id &&
        payload.buyers.map((val) => val.address.toLowerCase()).includes(account.toLowerCase())
    const shareSuccessLink = useShareLink(
        t('plugin_ito_claim_success_share', {
            link: postLink,
            symbol: token.symbol,
        }),
    )
    const canWithdraw =
        isAccountSeller && !tradeInfo?.destructInfo && (listOfStatus.includes(ITO_Status.expired) || noRemain)
    const refundAmount = tradeInfo?.buyInfo
        ? new BigNumber(tradeInfo?.buyInfo.amount).minus(new BigNumber(tradeInfo?.buyInfo.amount_sold))
        : new BigNumber(0)
    // out of stock
    const refundAllAmount = tradeInfo?.buyInfo && new BigNumber(tradeInfo?.buyInfo.amount_sold).isZero()

    const onShareSuccess = useCallback(async () => {
        window.open(shareSuccessLink, '_blank', 'noopener noreferrer')
    }, [shareSuccessLink])
    //#endregion

    const shareLink = useShareLink(
        t('plugin_ito_claim_foreshow_share', {
            link: postLink,
            name: token.name,
            symbol: token.symbol ?? 'token',
        }),
    )
    const onShare = useCallback(async () => {
        window.open(shareLink, '_blank', 'noopener noreferrer')
    }, [shareLink])
    const onClaim = useCallback(async () => setOpenClaimDialog(true), [])

    //#region withdraw
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (destructState.type !== TransactionStateType.CONFIRMED) return
            resetDestructCallback()
        },
    )

    useEffect(() => {
        if (destructState.type === TransactionStateType.UNKNOWN) return
        let summary = t('plugin_ito_withdraw')
        if (!noRemain) {
            summary += ' ' + formatBalance(total_remaining, token.decimals ?? 0) + ' ' + token.symbol
        }
        availability?.exchange_addrs.forEach((addr, i) => {
            const token = payload.exchange_tokens.find((t) => t.address.toLowerCase() === addr.toLowerCase())
            const comma = noRemain && i === 0 ? ' ' : ', '
            if (token) {
                summary +=
                    comma +
                    formatBalance(new BigNumber(availability?.exchanged_tokens[i]), token.decimals ?? 0) +
                    ' ' +
                    token.symbol
            }
        })
        setTransactionDialogOpen({
            open: true,
            state: destructState,
            summary,
        })
    }, [destructState])

    const onWithdraw = useCallback(async () => {
        destructCallback(payload.pid)
    }, [destructCallback, payload.pid])
    //#endregion

    const retryITOCard = useCallback(() => {
        retryPoolTradeInfo()
        retryAvailability()
    }, [retryPoolTradeInfo, retryAvailability])

    const swapStatusText = useMemo(() => {
        if (listOfStatus.includes(ITO_Status.waited)) return t('plugin_ito_status_no_start')
        if (listOfStatus.includes(ITO_Status.expired)) return t('plugin_ito_expired')
        if ((listOfStatus.includes(ITO_Status.completed) && isBuyer) || total_remaining.isZero()) {
            return t('plugin_ito_completed')
        } else if (listOfStatus.includes(ITO_Status.started)) {
            if (total_remaining.isZero()) {
                return t('plugin_ito_status_out_of_stock')
            }
            return t('plugin_ito_status_ongoing')
        }

        return ''
    }, [isBuyer, listOfStatus, t, total_remaining])

    const swapResultText = useMemo(() => {
        if (refundAllAmount) {
            return t('plugin_ito_out_of_stock_hit')
        }

        const _text = t('plugin_ito_your_claimed_amount', {
            amount: formatBalance(new BigNumber(availability?.swapped ?? 0), token.decimals),
            symbol: token.symbol,
        })

        if (refundAmount.isZero()) {
            return `${_text}.`
        }

        return `${_text}, ${t('plugin_ito_your_refund_amount', {
            amount: formatBalance(refundAmount, tradeInfo?.buyInfo?.token.decimals ?? 0),
            symbol: tradeInfo?.buyInfo?.token.symbol,
        })}`
    }, [
        availability?.swapped,
        refundAllAmount,
        refundAmount,
        t,
        token.decimals,
        token.symbol,
        tradeInfo?.buyInfo?.token.decimals,
        tradeInfo?.buyInfo?.token.symbol,
    ])

    const footerStartTime = useMemo(
        () => (
            <Typography variant="body1">
                {t('plugin_ito_list_start_date', { date: formatDateTime(new Date(start_time * 1000), true) })}
            </Typography>
        ),
        [start_time, t],
    )

    const footerEndTime = useMemo(
        () => (
            <Typography variant="body1">
                {t('plugin_ito_swap_end_date', {
                    date: formatDateTime(new Date(end_time * 1000), true),
                })}
            </Typography>
        ),
        [end_time, t],
    )

    const footerComplete = useMemo(
        () => (
            <>
                <Typography variant="body1">{swapResultText}</Typography>
                {footerEndTime}
            </>
        ),
        [footerEndTime, swapResultText],
    )

    const footerNormal = useMemo(
        () => (
            <>
                <Typography variant="body1">
                    {t('plugin_ito_allocation_per_wallet', {
                        limit: `: ${formatBalance(new BigNumber(limit), token.decimals)}`,
                        token: token.symbol,
                    })}
                </Typography>

                {listOfStatus.includes(ITO_Status.waited)
                    ? footerStartTime
                    : listOfStatus.includes(ITO_Status.started)
                    ? footerEndTime
                    : null}
            </>
        ),
        [footerEndTime, footerStartTime, limit, listOfStatus, t, token.decimals, token.symbol],
    )

    if (payload.chain_id !== chainId) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>

    return (
        <div>
            <Card className={classes.root} elevation={0} style={{ backgroundImage: `url(${PoolBackground})` }}>
                <Box className={classes.header}>
                    <Typography variant="h5" className={classes.title}>
                        {payload.message}
                    </Typography>

                    <Typography variant="body2" className={classes.status}>
                        {swapStatusText}
                    </Typography>
                </Box>
                <Typography variant="body2" className={classes.totalText}>
                    {t('plugin_ito_swapped_status', {
                        remain: formatAmountPrecision(sold, token.decimals),
                        total: formatAmountPrecision(total, token.decimals),
                        token: token.symbol,
                    })}
                    <Link
                        className={classes.tokenLink}
                        href={`${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNewIcon fontSize="small" className={classes.totalIcon} />
                    </Link>
                </Typography>
                <Box className={classes.progressWrap}>
                    <StyledLinearProgress
                        variant="determinate"
                        value={Number(sold.multipliedBy(100).dividedBy(total))}
                    />
                </Box>
                <Box>
                    {exchange_tokens
                        .slice(0, ITO_EXCHANGE_RATION_MAX)
                        .sort(sortTokens)
                        .map((exchangeToken, i) => (
                            <div className={classes.rationWrap} key={i}>
                                <TokenItem
                                    price={formatBalance(
                                        new BigNumber(exchange_amounts[i * 2])
                                            .dividedBy(new BigNumber(exchange_amounts[i * 2 + 1]))
                                            .multipliedBy(
                                                new BigNumber(10).pow(token.decimals - exchange_tokens[i].decimals),
                                            )
                                            .multipliedBy(new BigNumber(10).pow(exchange_tokens[i].decimals))
                                            .integerValue(),
                                        exchange_tokens[i].decimals,
                                    )}
                                    token={token}
                                    exchangeToken={exchangeToken}
                                />
                            </div>
                        ))}
                </Box>
                <Box className={classes.footer}>
                    <div>
                        {listOfStatus.includes(ITO_Status.completed)
                            ? footerComplete
                            : listOfStatus.includes(ITO_Status.expired)
                            ? footerEndTime
                            : footerNormal}
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        {`From: @${seller.name}`}
                    </Typography>
                </Box>
            </Card>

            <Box className={classes.actionFooter}>
                {(total_remaining.isZero() && !isBuyer) || loadingTradeInfo || loadingAvailability ? null : !account ||
                  !chainIdValid ? (
                    <ActionButton onClick={onConnect} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_wallet_connect_a_wallet')}
                    </ActionButton>
                ) : canWithdraw ? (
                    <ActionButton
                        onClick={onWithdraw}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_withdraw')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.completed) && isBuyer ? (
                    <ActionButton
                        onClick={onShareSuccess}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_share')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.expired) ? null : listOfStatus.includes(ITO_Status.waited) ? (
                    <ActionButton onClick={onShare} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_ito_share')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.started) ? (
                    <ActionButton onClick={onClaim} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_ito_enter')}
                    </ActionButton>
                ) : null}
            </Box>
            <ClaimGuide
                payload={payload}
                isBuyer={isBuyer}
                exchangeTokens={exchange_tokens}
                open={openClaimDialog}
                onClose={() => setOpenClaimDialog(false)}
                retryPayload={retryITOCard}
            />
        </div>
    )
}

export function ITO_Loading() {
    const { t } = useI18N()
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    const classes = useStyles()

    return (
        <div>
            <Card
                className={classNames(classes.root, classes.loadingWrap)}
                elevation={0}
                style={{ backgroundImage: `url(${PoolBackground})` }}>
                <Typography variant="body1" className={classes.loadingITO}>
                    {t('plugin_ito_loading')}
                </Typography>
            </Card>
        </div>
    )
}

function ITO_LoadingFailUI({ retryPoolPayload }: { retryPoolPayload: () => void }) {
    const { t } = useI18N()
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    const classes = useStyles()
    return (
        <Card
            className={classNames(classes.root, classes.loadingWrap)}
            elevation={0}
            style={{ backgroundImage: `url(${PoolBackground})` }}>
            <Typography variant="body1" className={classes.loadingITO}>
                {t('plugin_ito_loading_failed')}
            </Typography>
            <ActionButton
                onClick={retryPoolPayload}
                variant="outlined"
                size="large"
                color="primary"
                className={classes.loadingITO_Button}>
                {t('plugin_ito_loading_try_again')}
            </ActionButton>
        </Card>
    )
}

export class ITO_LoadingFail extends Component<{ retryPoolPayload: () => void }> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    state: { error: Error | null } = { error: null }
    render() {
        if (this.state.error) {
            return (
                <ITO_LoadingFailUI
                    retryPoolPayload={() => {
                        this.setState({ error: null })
                        this.props.retryPoolPayload()
                    }}
                />
            )
        }
        return this.props.children
    }
}
