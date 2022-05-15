import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    formatBalance,
    formatEthereumAddress,
    FungibleTokenDetailed,
    getChainDetailed,
    isSameAddress,
    currySameAddress,
    resolveLinkOnExplorer,
    TransactionStateType,
    useAccount,
    useChainId,
    useChainIdValid,
    useTokenConstants,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { isZero, ZERO, isGreaterThan } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Box, Card, Grid, Link, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import formatDateTime from 'date-fns/format'
import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/shared-base'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenIcon } from '@masknet/shared'
import { activatedSocialNetworkUI } from '../../../social-network'
import { getAssetAsBlobURL, getTextUILength, useI18N } from '../../../utils'
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
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { SharedIcon } from '../assets/shared'
import { PluginWalletConnectIcon } from '@masknet/icons'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { startCase } from 'lodash-unified'

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
        width: '100%',
        position: 'relative',
        color: theme.palette.common.white,
        flexDirection: 'column',
        height: props.tokenNumber! > 4 ? 425 : 405,
        minHeight: 405,
        boxSizing: 'border-box',
        backgroundAttachment: 'local',
        backgroundPosition: '-40px 0',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#FF5238',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        width: props.snsId === EnhanceableSite.Facebook ? '98%' : '100%',
        maxWidth: props.snsId === EnhanceableSite.Facebook ? 'auto' : '100%',
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
        background: theme.palette.mode === 'light' ? 'rgba(20, 23, 26, 0.6)' : 'rgba(239, 243, 244, 0.6)',
        padding: '5px 16px',
        whiteSpace: 'nowrap',
        borderRadius: 10,
    },
    totalText: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
    },
    tokenLink: {
        display: 'flex',
        alignItems: 'self-start',
        color: '#fff',
    },
    tokenIcon: {
        width: 24,
        height: 24,
    },
    totalIcon: {
        marginLeft: theme.spacing(0.5),
        width: 16,
        height: 16,
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
        maxWidth: props.snsId === EnhanceableSite.Facebook ? 'auto' : 470,
        bottom: theme.spacing(2),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'self-end',
    },
    footerInfo: {
        fontSize: 12,
    },
    fromText: {
        opacity: 0.6,
        fontSize: 14,
    },
    rationWrap: {
        marginBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& > span': {
            marginLeft: theme.spacing(1),
            fontSize: 12,
            '& > strong': {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
    },
    actionFooter: {
        padding: 0,
    },
    actionButton: {
        width: '100%',
        backgroundColor: MaskColorVar.buttonPluginBackground,
        color: 'white',
        fontSize: 14,
        paddingTop: 10,
        fontWeight: 700,
        margin: '0 !important',
        paddingBottom: 10,
        lineHeight: '20px',
        '&:hover': {
            backgroundColor: MaskColorVar.buttonPluginBackground,
        },
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
    claimDate: {
        marginTop: 16,
        color: '#F4212E',
    },
    grid: {
        width: '100%',
        margin: 0,
    },
}))

// #region token item
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
// #endregion

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

    const sellerName = payload.seller.name
        ? payload.seller.name
        : message.split(MSG_DELIMITER)[0] === message
        ? formatEthereumAddress(payload.seller.address, 4)
        : message.split(MSG_DELIMITER)[0]

    const title = message.split(MSG_DELIMITER)[1] ?? message
    const regions = message.split(MSG_DELIMITER)[2] ?? defaultRegions
    const { classes } = useStyles({
        titleLength: getTextUILength(title),
        tokenNumber: exchange_tokens.length,
        snsId: activatedSocialNetworkUI.networkIdentifier,
    })
    // #region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        loading: loadingAvailability,
        error: errorAvailability,
        retry: retryAvailability,
    } = useAvailabilityComputed(payload)

    const { listOfStatus, startTime, unlockTime, isUnlocked, hasLockTime, endTime, qualificationAddress } =
        availabilityComputed
    // #endregion
    const total = new BigNumber(payload_total)
    const total_remaining = new BigNumber(availability?.remaining ?? '0')
    const sold = total.minus(total_remaining)

    const { value: currentRegion, loading: loadingRegion } = useIPRegion()
    const allowRegions = decodeRegionCode(regions)
    const isRegionRestrict = checkRegionRestrict(allowRegions)
    const isRegionAllow =
        !isRegionRestrict || !currentRegion || (!loadingRegion && allowRegions.includes(currentRegion.code))

    // #region if qualified
    type Qual_V2 = { qualified: boolean; errorMsg: string }
    const {
        value: ifQualified = false,
        loading: loadingIfQualified,
        retry: retryIfQualified,
    } = useIfQualified(qualificationAddress, payload.contract_address)
    // #endregion

    const isAccountSeller = isSameAddress(payload.seller.address, account) && chainId === payload.chain_id
    const noRemain = total_remaining.isZero()

    // #region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    // #region buy info
    const { value: tradeInfo, loading: loadingTradeInfo, retry: retryPoolTradeInfo } = usePoolTradeInfo(pid, account)
    const isBuyer =
        chainId === payload.chain_id && (isGreaterThan(availability?.swapped ?? 0, 0) || Boolean(availability?.claimed))

    const successShareText = t(
        isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
            ? 'plugin_ito_claim_success_share'
            : 'plugin_ito_claim_success_share_no_official_account',
        {
            user: sellerName,
            link: postLink,
            symbol: token.symbol,
            account: isFacebook(activatedSocialNetworkUI) ? t('facebook_account') : t('twitter_account'),
        },
    )
    const canWithdraw = useMemo(
        () =>
            !availability?.destructed &&
            isAccountSeller &&
            !availability?.exchanged_tokens.every(isZero) &&
            (listOfStatus.includes(ITO_Status.expired) || noRemain),
        [tradeInfo, listOfStatus, isAccountSeller, noRemain, loadingTradeInfo],
    )

    const refundAmount = useMemo(() => {
        const buyInfo = tradeInfo?.buyInfo
        if (!buyInfo) return ZERO
        return new BigNumber(buyInfo.amount).minus(buyInfo.amount_sold)
    }, [tradeInfo])
    // out of stock
    const refundAllAmount = tradeInfo?.buyInfo && isZero(tradeInfo?.buyInfo.amount_sold)

    const onShareSuccess = useCallback(async () => {
        activatedSocialNetworkUI.utils.share?.(successShareText)
    }, [successShareText])
    // #endregion

    const retryITOCard = useCallback(() => {
        retryPoolTradeInfo()
        retryAvailability()
    }, [retryPoolTradeInfo, retryAvailability])

    // #region claim
    const [claimState, claimCallback] = useClaimCallback([pid], payload.contract_address)

    const { setDialog: setClaimTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            if (
                claimState.type !== TransactionStateType.CONFIRMED ||
                (claimState.type === TransactionStateType.CONFIRMED && claimState.no !== 0)
            )
                return
            window.location.reload()
        },
    )

    useEffect(() => {
        if (
            claimState.type === TransactionStateType.UNKNOWN ||
            (claimState.type === TransactionStateType.CONFIRMED && claimState.no !== 0)
        )
            return
        setClaimTransactionDialog({
            open: true,
            state: claimState,
            summary: `Claiming ${formatBalance(availability?.swapped ?? 0, token.decimals)} ${
                token?.symbol ?? 'Token'
            }.`,
        })
    }, [claimState /* update tx dialog only if state changed */])

    // #endregion

    const shareText = t(
        isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
            ? 'plugin_ito_claim_foreshow_share'
            : 'plugin_ito_claim_foreshow_share_no_official_account',
        {
            link: postLink,
            name: token.name,
            symbol: token.symbol ?? 'token',
            account: isFacebook(activatedSocialNetworkUI) ? t('facebook_account') : t('twitter_account'),
        },
    )
    const onShare = useCallback(async () => {
        activatedSocialNetworkUI.utils.share?.(shareText)
    }, [shareText])
    const onUnlock = useCallback(async () => {
        setClaimDialogStatus(SwapStatus.Unlock)
        setOpenClaimDialog(true)
    }, [])
    const onClaim = useCallback(async () => {
        setClaimDialogStatus(SwapStatus.Remind)
        setOpenClaimDialog(true)
    }, [])

    // #region withdraw
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (destructState.type !== TransactionStateType.CONFIRMED) return
            window.location.reload()
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
        if (destructState.type === TransactionStateType.UNKNOWN || !canWithdraw) return
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
    }, [destructState, canWithdraw])

    const onWithdraw = useCallback(async () => {
        destructCallback(payload.pid)
    }, [destructCallback, payload.pid])
    // #endregion

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

        const _text = new BigNumber(availability?.swapped || 0).isGreaterThan(0)
            ? t('plugin_ito_your_swapped_amount', {
                  amount: formatBalance(availability?.swapped || 0, token.decimals),
                  symbol: token.symbol,
              })
            : t('plugin_ito_your_claimed_amount', {
                  amount: formatBalance(tradeInfo?.buyInfo?.amount_bought || 0, token.decimals),
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

    const FooterStartTime = useMemo(() => {
        return (
            <Typography variant="body1" className={classes.footerInfo}>
                {t('plugin_ito_list_start_date', { date: formatDateTime(startTime, 'yyyy-MM-dd HH:mm') })}
            </Typography>
        )
    }, [startTime])

    const FooterEndTime = useMemo(
        () => (
            <Typography variant="body1" className={classes.footerInfo}>
                {t('plugin_ito_swap_end_date', { date: formatDateTime(endTime, 'yyyy-MM-dd HH:mm') })}
            </Typography>
        ),
        [endTime, t],
    )

    const FooterSwapInfo = useMemo(
        () => (
            <>
                <Typography variant="body1" className={classes.footerInfo}>
                    {swapResultText}
                </Typography>
                {FooterEndTime}
                {hasLockTime &&
                !isUnlocked &&
                unlockTime > Date.now() &&
                new BigNumber(availability?.swapped || 0).isGreaterThan(0) ? (
                    <Typography className={classes.footerInfo}>
                        {t('plugin_ito_wait_unlock_time', {
                            unlockTime: formatDateTime(unlockTime!, 'yyyy-MM-dd HH:mm'),
                        })}
                    </Typography>
                ) : null}
            </>
        ),
        [FooterEndTime, swapResultText],
    )

    const FooterNormal = useMemo(
        () => (
            <>
                <Typography variant="body1" className={classes.footerInfo}>
                    {t('plugin_ito_allocation_per_wallet', {
                        limit: formatBalance(limit, token.decimals),
                        token: token.symbol,
                    })}
                </Typography>

                {listOfStatus.includes(ITO_Status.waited)
                    ? FooterStartTime
                    : listOfStatus.includes(ITO_Status.started)
                    ? FooterEndTime
                    : null}
            </>
        ),
        [FooterEndTime, FooterStartTime, limit, listOfStatus, token.decimals, token.symbol],
    )

    const FooterBuyerLockedButton = useMemo(() => {
        if (!availability?.claimed) {
            return (
                <ActionButton
                    onClick={claimCallback}
                    variant="contained"
                    size="large"
                    disabled={claimState.type === TransactionStateType.HASH}
                    className={classes.actionButton}>
                    {claimState.type === TransactionStateType.HASH ? t('plugin_ito_claiming') : t('plugin_ito_claim')}
                </ActionButton>
            )
        }

        if (canWithdraw) {
            return (
                <ActionButton onClick={onWithdraw} variant="contained" size="large" className={classes.actionButton}>
                    {t('plugin_ito_withdraw')}
                </ActionButton>
            )
        }
        return null
    }, [availability?.claimed, canWithdraw, claimState])

    const FooterBuyerWithLockTimeButton = useMemo(
        () => (
            <Grid item xs={noRemain || listOfStatus.includes(ITO_Status.expired) ? 12 : 6}>
                {(() => {
                    if (isUnlocked) return FooterBuyerLockedButton

                    return (
                        <ActionButton
                            onClick={() => undefined}
                            variant="contained"
                            disabled
                            size="large"
                            className={classNames(classes.actionButton, classes.textInOneLine)}>
                            {t('plugin_ito_claim')}
                        </ActionButton>
                    )
                })()}
            </Grid>
        ),
        [noRemain, listOfStatus, isUnlocked],
    )

    const FooterBuyerButton = useMemo(
        () => (
            <div>
                {(() => {
                    if (hasLockTime)
                        return (
                            <Grid container spacing={2}>
                                {FooterBuyerWithLockTimeButton}
                            </Grid>
                        )
                    if (canWithdraw) {
                        return (
                            <ActionButton
                                onClick={onWithdraw}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_withdraw')}
                            </ActionButton>
                        )
                    }
                    return null
                })()}
            </div>
        ),
        [hasLockTime, canWithdraw],
    )

    return (
        <>
            <Card
                className={classes.root}
                elevation={0}
                style={{ backgroundImage: `url(${PoolBackground})`, backgroundRepeat: 'repeat' }}>
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
                        remain: formatBalance(sold, token.decimals),
                        total: formatBalance(total, token.decimals),
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
                    <div className={classes.footerInfo}>
                        {isBuyer
                            ? FooterSwapInfo
                            : listOfStatus.includes(ITO_Status.expired)
                            ? FooterEndTime
                            : FooterNormal}
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        From: @{sellerName}
                    </Typography>
                </Box>
            </Card>

            <Box className={classes.actionFooter}>
                {(() => {
                    if (loadingRegion && isRegionRestrict) return null

                    if (!isRegionAllow) {
                        return (
                            <ActionButton
                                disabled
                                onClick={() => undefined}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_region_ban')}
                            </ActionButton>
                        )
                    }

                    if (
                        (noRemain || listOfStatus.includes(ITO_Status.expired)) &&
                        !canWithdraw &&
                        ((availability?.claimed && hasLockTime) || !hasLockTime)
                    ) {
                        return null
                    }

                    if (loadingTradeInfo || loadingAvailability) {
                        return (
                            <ActionButton
                                disabled
                                onClick={() => undefined}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_loading')}
                            </ActionButton>
                        )
                    }

                    if (isBuyer) return FooterBuyerButton

                    if (canWithdraw) {
                        return (
                            <ActionButton
                                onClick={onWithdraw}
                                variant="contained"
                                size="large"
                                className={classes.actionButton}>
                                {t('plugin_ito_withdraw')}
                            </ActionButton>
                        )
                    }

                    if (
                        (!ifQualified || !(ifQualified as Qual_V2).qualified) &&
                        !isNativeTokenAddress(qualificationAddress)
                    ) {
                        return (
                            <Grid container spacing={2} className={classes.grid}>
                                <Grid item xs={6} style={{ padding: 12 }}>
                                    <ActionButton
                                        startIcon={<SharedIcon style={{ fontSize: 18 }} />}
                                        onClick={onShareSuccess}
                                        variant="contained"
                                        size="large"
                                        className={classes.actionButton}>
                                        {t('plugin_ito_share')}
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6} style={{ padding: 0 }}>
                                    <EthereumChainBoundary chainId={payload.chain_id}>
                                        <EthereumWalletConnectedBoundary
                                            hideRiskWarningConfirmed
                                            startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                                            classes={{ button: classes.actionButton }}>
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
                                        </EthereumWalletConnectedBoundary>
                                    </EthereumChainBoundary>
                                </Grid>
                            </Grid>
                        )
                    }

                    if (listOfStatus.includes(ITO_Status.expired)) return null

                    if (listOfStatus.includes(ITO_Status.waited)) {
                        return (
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
                                {shareText ? (
                                    <Grid item xs={6}>
                                        <ActionButton
                                            startIcon={<SharedIcon style={{ width: 18, height: 18 }} />}
                                            onClick={onShare}
                                            variant="contained"
                                            size="large"
                                            className={classes.actionButton}>
                                            {t('plugin_ito_share')}
                                        </ActionButton>
                                    </Grid>
                                ) : undefined}
                            </Grid>
                        )
                    }

                    if (listOfStatus.includes(ITO_Status.started)) {
                        return (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <ActionButton
                                        onClick={onClaim}
                                        variant="contained"
                                        size="large"
                                        className={classes.actionButton}>
                                        {t('plugin_ito_enter')}
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        startIcon={<SharedIcon style={{ width: 18, height: 18 }} />}
                                        onClick={onShareSuccess}
                                        variant="contained"
                                        size="large"
                                        className={classes.actionButton}>
                                        {t('plugin_ito_share')}
                                    </ActionButton>
                                </Grid>
                            </Grid>
                        )
                    }

                    return null
                })()}
            </Box>

            <SwapGuide
                status={claimDialogStatus}
                total_remaining={total_remaining}
                payload={{ ...payload, qualification_address: qualificationAddress }}
                shareSuccessText={successShareText}
                isBuyer={isBuyer}
                exchangeTokens={exchange_tokens}
                open={openClaimDialog}
                onUpdate={setClaimDialogStatus}
                onClose={() => setOpenClaimDialog(false)}
                retryPayload={retryITOCard}
            />
        </>
    )
}

export function ITO_Loading() {
    const { t } = useI18N()
    const PoolBackground = getAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    const { classes } = useStyles({})
    return (
        <div style={{ width: '100%' }}>
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
