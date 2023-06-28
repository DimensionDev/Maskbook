import { BigNumber } from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import { startCase } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    formatEthereumAddress,
    isNativeTokenAddress,
    explorerResolver,
    chainResolver,
    type ChainId,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import {
    isZero,
    ZERO,
    isGreaterThan,
    isSameAddress,
    formatBalance,
    type FungibleToken,
} from '@masknet/web3-shared-base'
import { Box, Card, Link, Typography } from '@mui/material'
import { TokenIcon, ChainBoundary, WalletConnectedBoundary, useAssetAsBlobURL } from '@masknet/shared'
import { makeStyles, ActionButton } from '@masknet/theme'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import { EnhanceableSite, NetworkPluginID, SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import { usePostLink } from '../../../components/DataSource/usePostInfo.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { getTextUILength, useI18N } from '../../../utils/index.js'
import { ITO_EXCHANGE_RATION_MAX, MSG_DELIMITER, TIME_WAIT_BLOCKCHAIN } from '../constants.js'
import { sortTokens } from './helpers.js'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed.js'
import { useClaimCallback } from './hooks/useClaimCallback.js'
import { useDestructCallback } from './hooks/useDestructCallback.js'
import { useIfQualified } from './hooks/useIfQualified.js'
import { usePoolTradeInfo } from './hooks/usePoolTradeInfo.js'
import { checkRegionRestrict, decodeRegionCode, useIPRegion } from './hooks/useRegion.js'
import { ITO_Status, type JSON_PayloadInMask } from '../types.js'
import { StyledLinearProgress } from './StyledLinearProgress.js'
import { SwapGuide, SwapStatus } from './SwapGuide.js'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base.js'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'

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
        display: 'flex',
        flex: 1,
    },
    actionButton: {
        width: '100%',
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
            borderColor: '#fff !important',
        },
        background: 'none',
    },
    loadingWrap: {
        display: 'flex',
        justifyContent: 'center',
    },
    textInOneLine: {
        whiteSpace: 'nowrap',
    },
}))

// #region token item
interface TokenItemProps {
    price: string
    token: FungibleToken<ChainId, SchemaType>
    exchangeToken: FungibleToken<ChainId, SchemaType>
}

function TokenItem({ price, token, exchangeToken }: TokenItemProps) {
    const { classes } = useStyles({})

    return (
        <>
            <TokenIcon
                className={classes.tokenIcon}
                address={exchangeToken.address}
                logoURL={exchangeToken.logoURL}
                chainId={token.chainId}
                name={exchangeToken.symbol}
            />
            <Typography component="span">
                <strong>{price}</strong>{' '}
                {isNativeTokenAddress(exchangeToken.address)
                    ? chainResolver.nativeCurrency(exchangeToken.chainId)?.symbol
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
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const postLink = usePostLink()
    const [, destructCallback] = useDestructCallback(props.payload.contract_address)
    const [openClaimDialog, setOpenClaimDialog] = useState(false)
    const [claimDialogStatus, setClaimDialogStatus] = useState(SwapStatus.Remind)

    // assets
    const PoolBackground = useAssetAsBlobURL(new URL('../assets/pool-background.jpg', import.meta.url))

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
    const { classes, cx } = useStyles({
        titleLength: getTextUILength(title),
        tokenNumber: exchange_tokens.length,
        snsId: activatedSocialNetworkUI.networkIdentifier,
    })
    // #region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        loading: loadingAvailability,
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
    type Qual_V2 = {
        qualified: boolean
        errorMsg: string
    }
    const {
        value: ifQualified = false,
        loading: loadingIfQualified,
        retry: retryIfQualified,
    } = useIfQualified(qualificationAddress, payload.contract_address)
    // #endregion

    const isAccountSeller = isSameAddress(payload.seller.address, account) && chainId === payload.chain_id
    const noRemain = total_remaining.isZero()

    // #region buy info
    const { value: tradeInfo, loading: loadingTradeInfo, retry: retryPoolTradeInfo } = usePoolTradeInfo(pid, account)
    const isBuyer =
        chainId === payload.chain_id && (isGreaterThan(availability?.swapped ?? 0, 0) || !!availability?.claimed)

    const isOnTwitter = isTwitter(activatedSocialNetworkUI)
    const isOnFacebook = isFacebook(activatedSocialNetworkUI)
    const context = isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : undefined
    const successShareText = t('plugin_ito_claim_success_share', {
        context,
        user: sellerName,
        link: postLink,
        symbol: token.symbol,
        sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
    })
    const canWithdraw = useMemo(() => {
        return (
            !availability?.destructed &&
            isAccountSeller &&
            !availability?.exchanged_tokens.every(isZero) &&
            (listOfStatus.includes(ITO_Status.expired) || noRemain)
        )
    }, [tradeInfo, listOfStatus, isAccountSeller, noRemain, loadingTradeInfo])

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

    const [{ loading: isClaiming }, claimCallback] = useClaimCallback([pid], payload.contract_address)

    const shareText = t('plugin_ito_claim_foreshow_share', {
        context,
        link: postLink,
        name: token.name,
        symbol: token.symbol ?? 'token',
        sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
    })
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

    const onWithdraw = useCallback(async () => {
        await destructCallback(payload.pid)
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

        const _text = isGreaterThan(availability?.swapped || 0, 0)
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
                            unlockTime: formatDateTime(unlockTime, 'yyyy-MM-dd HH:mm'),
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
                    variant="roundedDark"
                    fullWidth
                    loading={isClaiming}
                    onClick={claimCallback}
                    disabled={isClaiming}
                    className={classes.actionButton}>
                    {isClaiming ? t('plugin_ito_claiming') : t('plugin_ito_claim')}
                </ActionButton>
            )
        }

        if (canWithdraw) {
            return (
                <ActionButton onClick={onWithdraw} className={classes.actionButton} variant="roundedDark">
                    {t('plugin_ito_withdraw')}
                </ActionButton>
            )
        }
        return null
    }, [availability?.claimed, canWithdraw, isClaiming])

    const FooterBuyerWithLockTimeButton = useMemo(
        () => (
            <Box sx={{ flex: 1, padding: 1.5 }}>
                {(() => {
                    if (isUnlocked) return FooterBuyerLockedButton

                    return (
                        <ActionButton
                            variant="roundedDark"
                            onClick={() => undefined}
                            disabled
                            className={cx(classes.actionButton, classes.textInOneLine)}>
                            {t('plugin_ito_claim')}
                        </ActionButton>
                    )
                })()}
            </Box>
        ),
        [noRemain, listOfStatus, isUnlocked],
    )

    const FooterBuyerButton = useMemo(
        () => (
            <div style={{ width: '100%' }}>
                {(() => {
                    if (hasLockTime) return FooterBuyerWithLockTimeButton
                    if (canWithdraw) {
                        return (
                            <Box sx={{ flex: 1, padding: 1.5 }}>
                                <ActionButton
                                    onClick={onWithdraw}
                                    className={classes.actionButton}
                                    variant="roundedDark">
                                    {t('plugin_ito_withdraw')}
                                </ActionButton>
                            </Box>
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
                        href={explorerResolver.fungibleTokenLink(token.chainId, token.address)}
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
                                        exchangeToken.decimals,
                                        true,
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
                            <Box sx={{ flex: 1, padding: 1.5 }}>
                                <ActionButton
                                    disabled
                                    onClick={() => undefined}
                                    className={classes.actionButton}
                                    variant="roundedDark">
                                    {t('plugin_ito_region_ban')}
                                </ActionButton>
                            </Box>
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
                            <Box sx={{ flex: 1, padding: 1.5 }}>
                                <ActionButton
                                    disabled
                                    onClick={() => undefined}
                                    className={classes.actionButton}
                                    variant="roundedDark">
                                    {t('plugin_ito_loading')}
                                </ActionButton>
                            </Box>
                        )
                    }

                    if (isBuyer) return FooterBuyerButton

                    if (canWithdraw) {
                        return (
                            <Box sx={{ flex: 1, padding: 1.5 }}>
                                <ActionButton
                                    onClick={onWithdraw}
                                    className={classes.actionButton}
                                    variant="roundedDark">
                                    {t('plugin_ito_withdraw')}
                                </ActionButton>
                            </Box>
                        )
                    }

                    if (
                        (!ifQualified || !(ifQualified as Qual_V2).qualified) &&
                        !isNativeTokenAddress(qualificationAddress)
                    ) {
                        return (
                            <>
                                <Box style={{ padding: '12px 5px', flex: 1 }}>
                                    <ActionButton
                                        startIcon={<Icons.Shared size={18} />}
                                        onClick={onShareSuccess}
                                        className={classes.actionButton}
                                        variant="roundedDark">
                                        {t('plugin_ito_share')}
                                    </ActionButton>
                                </Box>
                                <Box style={{ padding: '12px 5px', flex: 1 }}>
                                    <ChainBoundary
                                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                        expectedChainId={payload.chain_id}
                                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                                        <WalletConnectedBoundary
                                            expectedChainId={payload.chain_id}
                                            hideRiskWarningConfirmed
                                            startIcon={<Icons.ConnectWallet size={18} />}
                                            ActionButtonProps={{ variant: 'roundedDark' }}
                                            classes={{ button: classes.actionButton }}>
                                            <ActionButton
                                                variant="roundedDark"
                                                onClick={retryIfQualified}
                                                loading={loadingIfQualified}
                                                className={classes.actionButton}>
                                                {loadingIfQualified
                                                    ? t('plugin_ito_qualification_loading')
                                                    : !ifQualified
                                                    ? t('plugin_ito_qualification_failed')
                                                    : !(ifQualified as Qual_V2).qualified
                                                    ? startCase((ifQualified as Qual_V2).errorMsg)
                                                    : null}
                                            </ActionButton>
                                        </WalletConnectedBoundary>
                                    </ChainBoundary>
                                </Box>
                            </>
                        )
                    }

                    if (listOfStatus.includes(ITO_Status.expired)) return null

                    if (listOfStatus.includes(ITO_Status.waited)) {
                        return (
                            <>
                                <Box style={{ padding: '12px 5px', flex: 1 }}>
                                    <ActionButton
                                        onClick={onUnlock}
                                        className={classes.actionButton}
                                        variant="roundedDark">
                                        {t('plugin_ito_unlock_in_advance')}
                                    </ActionButton>
                                </Box>
                                {shareText ? (
                                    <Box style={{ flex: 1, padding: '12px 5px' }}>
                                        <ActionButton
                                            startIcon={<Icons.Shared size={18} />}
                                            onClick={onShare}
                                            className={classes.actionButton}
                                            variant="roundedDark">
                                            {t('plugin_ito_share')}
                                        </ActionButton>
                                    </Box>
                                ) : undefined}
                            </>
                        )
                    }

                    if (listOfStatus.includes(ITO_Status.started)) {
                        return (
                            <>
                                <Box style={{ flex: 1, padding: '12px 5px' }}>
                                    <ActionButton
                                        onClick={onClaim}
                                        className={classes.actionButton}
                                        variant="roundedDark">
                                        {t('plugin_ito_enter')}
                                    </ActionButton>
                                </Box>
                                <Box style={{ flex: 1, padding: '12px 5px' }}>
                                    <ActionButton
                                        startIcon={<Icons.Shared size={18} />}
                                        onClick={onShareSuccess}
                                        className={classes.actionButton}
                                        variant="roundedDark">
                                        {t('plugin_ito_share')}
                                    </ActionButton>
                                </Box>
                            </>
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
    const PoolBackground = useAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    const { classes, cx } = useStyles({})
    return (
        <div style={{ width: '100%' }}>
            <Card
                className={cx(classes.root, classes.loadingWrap)}
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
    const { classes, cx } = useStyles({})
    const PoolBackground = useAssetAsBlobURL(new URL('../assets/pool-loading-background.jpg', import.meta.url))
    return (
        <Card
            className={cx(classes.root, classes.loadingWrap)}
            elevation={0}
            style={{ backgroundImage: `url(${PoolBackground})` }}>
            <Typography variant="body1" className={classes.loadingITO}>
                {t('loading_failed')}
            </Typography>
            <ActionButton onClick={retryPoolPayload} variant="outlined" className={classes.loadingITO_Button}>
                {t('try_again')}
            </ActionButton>
        </Card>
    )
}
