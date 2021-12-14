import {
    formatAmountPrecision,
    formatBalance,
    formatEthereumAddress,
    FungibleTokenDetailed,
    getChainDetailed,
    isSameAddress,
    currySameAddress,
    isZero,
    resolveLinkOnExplorer,
    TransactionStateType,
    useAccount,
    useChainId,
    useChainIdValid,
    useTokenConstants,
    ZERO,
    isGreaterThan,
} from '@masknet/web3-shared-evm'
import { Box, Card, Grid, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import formatDateTime from 'date-fns/format'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenIcon } from '@masknet/shared'
import { activatedSocialNetworkUI } from '../../../social-network'
import { getAssetAsBlobURL, getTextUILength, useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../Wallet/messages'
import { ITO_EXCHANGE_RATION_MAX, MSG_DELIMITER, TIME_WAIT_BLOCKCHAIN } from '../constants'
import { sortTokens } from './helpers'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed'
import { useClaimCallback } from './hooks/useClaimCallback'
import { useDestructCallback } from './hooks/useDestructCallback'
import { useIfQualified } from './hooks/useIfQualified'
import { usePoolTradeInfo } from './hooks/usePoolTradeInfo'
import { checkRegionRestrict, decodeRegionCode, useIPRegion } from './hooks/useRegion'
import { ITO_Status, JSON_PayloadInMask } from '../types'
import { StyledLinearProgress } from './StyledLinearProgress'
import { SwapGuide, SwapStatus } from './SwapGuide'
import urlcat from 'urlcat'
import { startCase } from 'lodash-unified'
import { FACEBOOK_ID } from '../../../social-network-adaptor/facebook.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

export interface IconProps {
    size?: number
}

interface StyleProps {
    titleLength?: number
    tokenNumber?: number
    snsId?: string
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        position: 'relative',
        color: theme.palette.common.white,
        flexDirection: 'column',
        height: props.tokenNumber! > 4 ? 425 : 405,
        minHeight: 405,
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
        alignItems: 'end',
        width: props.snsId === FACEBOOK_ID ? '98%' : '100%',
        maxWidth: props.snsId === FACEBOOK_ID ? 'auto' : 470,
    },
    title: {
        fontSize: props.titleLength! > 31 ? '1.3rem' : '1.6rem',
        fontWeight: 'bold',
        marginBottom: 4,
        marginRight: 4,
        width: '80%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    status: {
        background: 'rgba(20, 23, 26, 0.6)',
        padding: '5px 16px',
        whiteSpace: 'nowrap',
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
        maxWidth: props.snsId === FACEBOOK_ID ? 'auto' : 470,
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
        color: '#fff',
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
    textInOneLine: {
        whiteSpace: 'nowrap',
    },
}))

//#region token item
interface TokenItemProps {
    price: string
    token: FungibleTokenDetailed
    exchangeToken: FungibleTokenDetailed
}

const TokenItem = ({ price, token, exchangeToken }: TokenItemProps) => {
    const { classes } = useStyles({})
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    return (
        <>
            <TokenIcon
                classes={{ icon: classes.tokenIcon }}
                address={exchangeToken.address}
                logoURI={exchangeToken.logoURI}
            />
            <Typography component="span">
                <strong>{price}</strong>{' '}
                {isSameAddress(exchangeToken.address, NATIVE_TOKEN_ADDRESS)
                    ? getChainDetailed(exchangeToken.chainId)?.nativeCurrency.symbol
                    : exchangeToken.symbol}{' '}
                / {token.symbol}
            </Typography>
        </>
    )
}
//#endregion

export interface ITO_Props {
    pid: string
    payload: JSON_PayloadInMask
}

export function ITO(props: ITO_Props) {
    // context
    const account = useAccount()
    const postLink = usePostLink()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const [destructState, destructCallback, resetDestructCallback] = useDestructCallback(props.payload.contract_address)
    const [openClaimDialog, setOpenClaimDialog] = useState(false)
    const [claimDialogStatus, setClaimDialogStatus] = useState(SwapStatus.Remind)

    // assets
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-background.jpg', import.meta.url))

    const { pid, payload } = props
    const { regions: defaultRegions = '-' } = props.payload
    const { token, total: payload_total, exchange_amounts, exchange_tokens, limit, message } = payload

    const { t } = useI18N()
    const sellerName =
        message.split(MSG_DELIMITER)[0] === message
            ? formatEthereumAddress(payload.seller.address, 4)
            : message.split(MSG_DELIMITER)[0]
    const title = message.split(MSG_DELIMITER)[1] ?? message
    const regions = message.split(MSG_DELIMITER)[2] ?? defaultRegions
    const { classes } = useStyles({
        titleLength: getTextUILength(title),
        tokenNumber: exchange_tokens.length,
        snsId: activatedSocialNetworkUI.networkIdentifier,
    })
    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        loading: loadingAvailability,
        error: errorAvailability,
        retry: retryAvailability,
    } = useAvailabilityComputed(payload)

    const { listOfStatus, startTime, unlockTime, isUnlocked, hasLockTime, endTime, qualificationAddress } =
        availabilityComputed
    //#endregion

    const total = new BigNumber(payload_total)
    const total_remaining = new BigNumber(availability?.remaining ?? '0')
    const sold = total.minus(total_remaining)

    const { value: currentRegion, loading: loadingRegion } = useIPRegion()
    const allowRegions = decodeRegionCode(regions)
    const isRegionRestrict = checkRegionRestrict(allowRegions)
    const isRegionAllow =
        !isRegionRestrict || !currentRegion || (!loadingRegion && allowRegions.includes(currentRegion.code))

    //#region if qualified
    type Qual_V2 = { qualified: boolean; errorMsg: string }
    const {
        value: ifQualified = false,
        loading: loadingIfQualified,
        retry: retryIfQualified,
    } = useIfQualified(qualificationAddress, payload.contract_address)
    //#endregion

    const isAccountSeller =
        payload.seller.address.toLowerCase() === account.toLowerCase() && chainId === payload.chain_id
    const noRemain = total_remaining.isZero()

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region buy info
    const { value: tradeInfo, loading: loadingTradeInfo, retry: retryPoolTradeInfo } = usePoolTradeInfo(pid, account)
    const isBuyer =
        chainId === payload.chain_id && (isGreaterThan(availability?.swapped ?? 0, 0) || Boolean(availability?.claimed))

    const shareSuccessLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            t(
                isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                    ? 'plugin_ito_claim_success_share'
                    : 'plugin_ito_claim_success_share_no_official_account',
                {
                    user: sellerName,
                    link: postLink,
                    symbol: token.symbol,
                    account: isFacebook(activatedSocialNetworkUI) ? t('facebook_account') : t('twitter_account'),
                },
            ),
        )
        .toString()
    const canWithdraw = useMemo(
        () =>
            isAccountSeller &&
            !tradeInfo?.destructInfo &&
            !availability?.exchanged_tokens.every((t) => t === '0') &&
            (listOfStatus.includes(ITO_Status.expired) || noRemain),
        [tradeInfo, listOfStatus, isAccountSeller, noRemain],
    )

    const refundAmount = useMemo(() => {
        const buyInfo = tradeInfo?.buyInfo
        if (!buyInfo) return ZERO
        return new BigNumber(buyInfo.amount).minus(buyInfo.amount_sold)
    }, [tradeInfo])
    // out of stock
    const refundAllAmount = tradeInfo?.buyInfo && isZero(tradeInfo?.buyInfo.amount_sold)

    const onShareSuccess = useCallback(async () => {
        window.open(shareSuccessLink, '_blank', 'noopener noreferrer')
    }, [shareSuccessLink])
    //#endregion

    const retryITOCard = useCallback(() => {
        retryPoolTradeInfo()
        retryAvailability()
    }, [retryPoolTradeInfo, retryAvailability])

    //#region claim
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback([pid], payload.contract_address)
    const onClaimButtonClick = useCallback(() => {
        claimCallback()
    }, [claimCallback])

    const { setDialog: setClaimTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (claimState.type !== TransactionStateType.CONFIRMED) return
            resetClaimCallback()
            retryITOCard()
        },
    )

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return
        setClaimTransactionDialog({
            open: true,
            state: claimState,
            summary: `Claiming ${formatBalance(availability?.swapped ?? 0, token.decimals)} ${
                token?.symbol ?? 'Token'
            }.`,
        })
    }, [claimState /* update tx dialog only if state changed */])

    //#endregion

    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            t(
                isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                    ? 'plugin_ito_claim_foreshow_share'
                    : 'plugin_ito_claim_foreshow_share_no_official_account',
                {
                    link: postLink,
                    name: token.name,
                    symbol: token.symbol ?? 'token',
                    account: isFacebook(activatedSocialNetworkUI) ? t('facebook_account') : t('twitter_account'),
                },
            ),
        )
        .toString()
    const onShare = useCallback(async () => {
        window.open(shareLink, '_blank', 'noopener noreferrer')
    }, [shareLink])
    const onUnlock = useCallback(async () => {
        setClaimDialogStatus(SwapStatus.Unlock)
        setOpenClaimDialog(true)
    }, [])
    const onClaim = useCallback(async () => {
        setClaimDialogStatus(SwapStatus.Remind)
        setOpenClaimDialog(true)
    }, [])

    //#region withdraw
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (destructState.type !== TransactionStateType.CONFIRMED) return
            resetDestructCallback()
            retryITOCard()
        },
    )

    useEffect(() => {
        const timeToExpired = endTime - Date.now()

        // https://stackoverflow.com/q/3468607
        // SetTimeout using a 32 bit int to store the delay so the max value allowed would be 2147483647.
        // Meanwhile, no need to refresh ITO card when expired time is a large value (more than one day).
        if (timeToExpired < 0 || listOfStatus.includes(ITO_Status.expired) || timeToExpired > 1000 * 60 * 60 * 24)
            return

        const timer = setTimeout(() => {
            setOpenClaimDialog(false)
            retryITOCard()
        }, timeToExpired + TIME_WAIT_BLOCKCHAIN)

        return () => clearTimeout(timer)
    }, [endTime, listOfStatus])

    useEffect(() => {
        if (destructState.type === TransactionStateType.UNKNOWN) return
        let summary = t('plugin_ito_withdraw')
        if (!noRemain) {
            summary += ' ' + formatBalance(total_remaining, token.decimals) + ' ' + token.symbol
        }
        availability?.exchange_addrs.forEach((addr, i) => {
            const token = exchange_tokens.find(currySameAddress(addr))
            const comma = noRemain && i === 0 ? ' ' : ', '
            if (token) {
                summary += comma + formatBalance(availability?.exchanged_tokens[i], token.decimals) + ' ' + token.symbol
            }
        })
        setTransactionDialog({
            open: true,
            state: destructState,
            summary,
        })
    }, [destructState])

    const onWithdraw = useCallback(async () => {
        destructCallback(payload.pid)
    }, [destructCallback, payload.pid])
    //#endregion

    const swapStatusText = useMemo(() => {
        if (listOfStatus.includes(ITO_Status.waited)) return t('plugin_ito_status_no_start')
        if (listOfStatus.includes(ITO_Status.expired)) return t('plugin_ito_expired')
        if (listOfStatus.includes(ITO_Status.started)) {
            if (total_remaining.isZero()) return t('plugin_ito_status_out_of_stock')
            return t('plugin_ito_status_ongoing')
        }
        return ''
    }, [listOfStatus, total_remaining])

    const swapResultText = useMemo(() => {
        if (refundAllAmount) {
            return t('plugin_ito_out_of_stock_hit')
        }

        const _text =
            Number(availability?.swapped) > 0
                ? t('plugin_ito_your_swapped_amount', {
                      amount: formatBalance(availability?.swapped ?? 0, token.decimals),
                      symbol: token.symbol,
                  })
                : t('plugin_ito_your_claimed_amount', {
                      amount: formatBalance(tradeInfo?.buyInfo?.amount_bought ?? 0, token.decimals),
                      symbol: token.symbol,
                  })

        if (refundAmount.isZero() || refundAmount.isLessThan(0)) {
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
        token.decimals,
        token.symbol,
        tradeInfo?.buyInfo?.token.decimals,
        tradeInfo?.buyInfo?.token.symbol,
    ])

    const footerStartTime = useMemo(() => {
        return (
            <Typography variant="body1">
                {t('plugin_ito_list_start_date', { date: formatDateTime(startTime, 'yyyy-MM-dd HH:mm') })}
            </Typography>
        )
    }, [startTime])

    const footerEndTime = useMemo(
        () => (
            <Typography variant="body1">
                {t('plugin_ito_swap_end_date', { date: formatDateTime(endTime, 'yyyy-MM-dd HH:mm') })}
            </Typography>
        ),
        [endTime, t],
    )

    const footerSwapInfo = useMemo(
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
                        limit: formatBalance(limit, token.decimals),
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
        [footerEndTime, footerStartTime, limit, listOfStatus, token.decimals, token.symbol],
    )

    return (
        <div>
            <Card className={classes.root} elevation={0} style={{ backgroundImage: `url(${PoolBackground})` }}>
                <Box className={classes.header}>
                    <Typography variant="h5" className={classes.title}>
                        {title}
                    </Typography>
                    {swapStatusText ? (
                        <Typography variant="body2" className={classes.status}>
                            {swapStatusText}
                        </Typography>
                    ) : null}
                </Box>
                <Typography variant="body2" className={classes.totalText}>
                    {t('plugin_ito_swapped_status', {
                        remain: formatAmountPrecision(sold, token.decimals, undefined, token.decimals),
                        total: formatAmountPrecision(total, token.decimals, undefined, token.decimals),
                        token: token.symbol,
                    })}
                    <Link
                        className={classes.tokenLink}
                        href={urlcat(resolveLinkOnExplorer(token.chainId), '/token/:address', {
                            address: token.address,
                        })}
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
                                            .dividedBy(exchange_amounts[i * 2 + 1])
                                            .shiftedBy(token.decimals - exchangeToken.decimals)
                                            .shiftedBy(exchangeToken.decimals)
                                            .integerValue(),
                                        exchangeToken.decimals,
                                    )}
                                    token={token}
                                    exchangeToken={exchangeToken}
                                />
                            </div>
                        ))}
                </Box>
                <Box className={classes.footer}>
                    <div>
                        {isBuyer
                            ? footerSwapInfo
                            : listOfStatus.includes(ITO_Status.expired)
                            ? footerEndTime
                            : footerNormal}
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        {`From: @${sellerName}`}
                    </Typography>
                </Box>
            </Card>

            <Box className={classes.actionFooter}>
                {loadingRegion && isRegionRestrict ? null : !isRegionAllow ? (
                    <ActionButton
                        disabled
                        onClick={() => undefined}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_region_ban')}
                    </ActionButton>
                ) : total_remaining.isZero() && !isBuyer && !canWithdraw ? (
                    <ActionButton
                        disabled
                        onClick={() => undefined}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_status_out_of_stock')}
                    </ActionButton>
                ) : loadingTradeInfo || loadingAvailability ? (
                    <ActionButton
                        disabled
                        onClick={() => undefined}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_loading')}
                    </ActionButton>
                ) : !account || !chainIdValid ? (
                    <ActionButton
                        onClick={openSelectProviderDialog}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
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
                ) : isBuyer ? (
                    <Grid container spacing={2}>
                        {hasLockTime ? (
                            <Grid item xs={6}>
                                {isUnlocked ? (
                                    !availability?.claimed ? (
                                        <ActionButton
                                            onClick={onClaimButtonClick}
                                            variant="contained"
                                            size="large"
                                            disabled={claimState.type === TransactionStateType.HASH}
                                            className={classes.actionButton}>
                                            {claimState.type === TransactionStateType.HASH
                                                ? t('plugin_ito_claiming')
                                                : t('plugin_ito_claim')}
                                        </ActionButton>
                                    ) : (
                                        <ActionButton
                                            onClick={() => undefined}
                                            disabled
                                            variant="contained"
                                            size="large"
                                            className={classes.actionButton}>
                                            {t('plugin_ito_claimed')}
                                        </ActionButton>
                                    )
                                ) : (
                                    <ActionButton
                                        onClick={() => undefined}
                                        variant="contained"
                                        disabled
                                        size="large"
                                        className={classNames(classes.actionButton, classes.textInOneLine)}>
                                        {t('plugin_ito_wait_unlock_time', {
                                            unlockTime: formatDateTime(unlockTime!, 'yyyy-MM-dd HH:mm'),
                                        })}
                                    </ActionButton>
                                )}
                            </Grid>
                        ) : null}
                        <Grid item xs={hasLockTime ? 6 : 12}>
                            <ActionButton
                                onClick={onShareSuccess}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_share')}
                            </ActionButton>
                        </Grid>
                    </Grid>
                ) : !ifQualified || !(ifQualified as Qual_V2).qualified ? (
                    <ActionButton
                        onClick={retryIfQualified}
                        loading={loadingIfQualified}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {loadingIfQualified
                            ? t('plugin_ito_qualification_loading')
                            : !ifQualified
                            ? t('plugin_ito_qualification_failed')
                            : !(ifQualified as Qual_V2).qualified
                            ? startCase((ifQualified as Qual_V2).errorMsg)
                            : null}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.expired) ? (
                    <ActionButton
                        disabled
                        onClick={() => undefined}
                        variant="contained"
                        size="large"
                        className={classes.actionButton}>
                        {t('plugin_ito_expired')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.waited) ? (
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <ActionButton
                                onClick={onUnlock}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_unlock_in_advance')}
                            </ActionButton>
                        </Grid>
                        {shareLink ? (
                            <Grid item xs={6}>
                                <ActionButton
                                    onClick={onShare}
                                    variant="contained"
                                    size="large"
                                    className={classes.actionButton}>
                                    {t('plugin_ito_share')}
                                </ActionButton>
                            </Grid>
                        ) : undefined}
                    </Grid>
                ) : listOfStatus.includes(ITO_Status.started) ? (
                    <ActionButton onClick={onClaim} variant="contained" size="large" className={classes.actionButton}>
                        <Typography>{t('plugin_ito_enter')}</Typography>
                    </ActionButton>
                ) : null}
            </Box>
            <SwapGuide
                status={claimDialogStatus}
                total_remaining={total_remaining}
                payload={{ ...payload, qualification_address: qualificationAddress }}
                shareSuccessLink={shareSuccessLink}
                isBuyer={isBuyer}
                exchangeTokens={exchange_tokens}
                open={openClaimDialog}
                onUpdate={setClaimDialogStatus}
                onClose={() => setOpenClaimDialog(false)}
                retryPayload={retryITOCard}
            />
        </div>
    )
}

export function ITO_Loading() {
    const { t } = useI18N()
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    const { classes } = useStyles({})
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

export function ITO_Error({ retryPoolPayload }: { retryPoolPayload: () => void }) {
    const { t } = useI18N()
    const { classes } = useStyles({})
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    return (
        <Card
            className={classNames(classes.root, classes.loadingWrap)}
            elevation={0}
            style={{ backgroundImage: `url(${PoolBackground})` }}>
            <Typography variant="body1" className={classes.loadingITO}>
                {t('loading_failed')}
            </Typography>
            <ActionButton
                onClick={retryPoolPayload}
                variant="outlined"
                size="large"
                color="primary"
                className={classes.loadingITO_Button}>
                {t('try_again')}
            </ActionButton>
        </Card>
    )
}
