import { Icons } from '@masknet/icons'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'
import { PluginTransakMessages, useTransakAllowanceCoin } from '@masknet/plugin-transak'
import {
    EnhanceableSite_RSS3_NFT_SITE_KEY_map,
    Linking,
    NFTSpamBadge,
    PriceChange,
    TokenSecurityBar,
    TokenWithSocialGroupMenu,
    useReportSpam,
    useSocialAccountsBySettings,
    useTokenMenuCollectionList,
    useTokenSecurity,
} from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    PluginID,
    type EnhanceableSite,
    type NetworkPluginID,
    type SocialIdentity,
} from '@masknet/shared-base'
import { useAnchor, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { LoadingBase, MaskColors, MaskLightTheme, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType, TokenType, formatCurrency } from '@masknet/web3-shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import {
    Avatar,
    Box,
    Button,
    CardContent,
    IconButton,
    Paper,
    Stack,
    ThemeProvider,
    Typography,
    useTheme,
} from '@mui/material'
import { first, last } from 'lodash-es'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ContentTab, type Currency, type Stat } from '../../types/index.js'
import { CoinIcon } from './CoinIcon.js'
import { TrendingCard, type TrendingCardProps } from './TrendingCard.js'
import { TrendingViewDescriptor } from './TrendingViewDescriptor.js'
import { TrendingViewContext } from './context.js'
import { useActivatedPluginSiteAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
}>()((theme, props) => {
    return {
        content: {
            paddingTop: 0,
            paddingBottom: '0 !important',
            '&:last-child': {
                padding: 0,
            },
        },
        cardHeader: {
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(6.5),
            background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        headline: {
            marginTop: props.isCollectionProjectPopper || props.isTokenTagPopper ? 0 : 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'relative',
        },
        title: {
            display: 'flex',
            maxWidth: 350,
            alignItems: 'center',
            whiteSpace: 'nowrap',
        },
        name: {
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor.dark,
        },
        symbol: {
            fontWeight: 700,
            fontSize: 18,
            color: theme.palette.maskColor.dark,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
            display: 'flex',
            alignItems: 'center',
        },
        symbolText: {
            display: 'inline-block',
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontStyle: 'normal',
            overflow: 'hidden',
            textTransform: 'uppercase',
        },
        rank: {
            display: 'inline-flex',
            padding: theme.spacing(0.25, 0.5),
            color: theme.palette.maskColor.white,
            fontWeight: 400,
            fontSize: 10,
            background: theme.palette.maskColor.dark,
            borderRadius: theme.spacing(0.5),
        },
        avatar: {
            width: 24,
            height: 24,
            fontSize: 10,
            backgroundColor: theme.palette.common.white,
        },
        buttons: {
            marginLeft: 'auto',
            display: 'flex',
            gap: theme.spacing(0.5),
        },
        icon: {
            color: MaskColors.dark.maskColor.dark,
        },
        pluginDescriptorWrapper: {
            padding: '15px 17px 15px 13px',
            position: 'absolute',
            width: '100%',
            height: 48,
            left: 0,
            bottom: 12,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            background: theme.palette.maskColor.bg,
            backdropFilter: 'blur(5px)',
            boxSizing: 'border-box',
            borderBottomRightRadius: '16px',
            borderBottomLeftRadius: '16px',
            zIndex: 2,
        },
        link: {
            outline: 0,
        },
    }
})

interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content' | 'cardHeader'> {
    stats: Stat[]
    currency: Currency
    currentTab: ContentTab
    trending: TrendingAPI.Trending
    identity?: SocialIdentity | null
    setActive?: (x: boolean) => void
    setResult: (a: Web3Helper.TokenResultAll) => void
    result: Web3Helper.TokenResultAll
    resultList?: Web3Helper.TokenResultAll[]
    children?: React.ReactNode
    TrendingCardProps?: Partial<TrendingCardProps>
    isSwappable?: boolean
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        trending,
        stats,
        children,
        TrendingCardProps,
        resultList = EMPTY_LIST,
        result,
        setResult,
        setActive,
        currentTab,
        identity,
        isSwappable,
    } = props

    const { coin, market } = trending
    const [walletMenuOpen, setWalletMenuOpen] = useState(false)
    const closeMenu = useCallback(() => setWalletMenuOpen(false), [])
    const { isCollectionProjectPopper, isTokenTagPopper, isPreciseSearch, isProfilePage } =
        useContext(TrendingViewContext)
    const { anchorEl, anchorBounding } = useAnchor()
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
    const theme = useTheme()
    const { classes } = useStyles({ isTokenTagPopper, isCollectionProjectPopper }, { props })
    const isNFT = coin.type === TokenType.NonFungible

    // #region buy

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isAllowanceCoin = useTransakAllowanceCoin({ address: coin.contract_address, symbol: coin.symbol })
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const isTokenSecurityEnable = !useIsMinimalMode(PluginID.GoPlusSecurity) && !isNFT
    const isTransakEnabled = !!useActivatedPluginSiteAdaptor(PluginID.Transak, false)

    const { value: tokenSecurity, error } = useTokenSecurity(
        coin.chainId,
        coin.contract_address?.trim(),
        isTokenSecurityEnable,
    )

    const isBuyable = !isNFT && isTransakEnabled && coin.symbol && isAllowanceCoin
    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, coin.symbol])
    // #endregion

    // #region swap
    const { setDialog: setExchangeDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.swapDialogEvent)

    const onExchangeButtonClicked = useCallback(() => {
        setExchangeDialog({
            open: true,
            traderProps: {
                address: coin.contract_address,
                chainId: coin.chainId,
            },
        })
    }, [])
    // #endregion

    const titleRef = useRef<HTMLDivElement>(null)

    const coinAddress = coin.address || coin.contract_address
    const coinName = result.name || coin.name

    const collectionList = useTokenMenuCollectionList(resultList, result)

    const rss3Key = EnhanceableSite_RSS3_NFT_SITE_KEY_map[identity?.identifier?.network as EnhanceableSite]
    const { data: socialAccounts = EMPTY_LIST } = useSocialAccountsBySettings(
        identity,
        undefined,
        undefined,
        signWithPersona,
    )

    const openRss3Profile = useCallback(
        (address: string) => {
            if (!isCollectionProjectPopper) {
                CrossIsolationMessages.events.hideSearchResultInspectorEvent.sendToLocal({ hide: true })
                return
            }

            if (!identity?.identifier?.userId || !anchorBounding) return

            CrossIsolationMessages.events.profileCardEvent.sendToLocal({
                open: true,
                userId: identity.identifier.userId,
                anchorBounding,
                anchorEl,
                address,
                external: true,
            })
            setActive?.(false)
        },
        [identity, isCollectionProjectPopper, anchorBounding, anchorEl],
    )

    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: coin.address,
        chainId: coin.chainId,
    })

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current)

        if (isCollectionProjectPopper || isTokenTagPopper) {
            timer.current = setTimeout(() => {
                Telemetry.captureEvent(
                    EventType.Access,
                    isNFT ? EventID.EntryTimelineHoverNftDuration : EventID.EntryTimelineHoverTokenDuration,
                )
            }, 1000)
        }
        return () => {
            if (timer) clearTimeout(timer.current)
            timer.current = undefined
        }
    }, [isCollectionProjectPopper, isTokenTagPopper, isProfilePage, isNFT])

    const floorPrice =
        trending.dataProvider === SourceType.CoinMarketCap ?
            last(stats)?.[1] ?? market?.current_price
        :   market?.current_price
    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.cardHeader}>
                {isCollectionProjectPopper || isTokenTagPopper ? null : (
                    <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                )}
                <Stack className={classes.headline}>
                    <Stack gap={2} flexGrow={1}>
                        <Stack>
                            <Stack component="div" flexDirection="row" alignItems="center" gap={0.5} ref={titleRef}>
                                <Linking LinkProps={{ className: classes.link }} href={first(coin.home_urls)}>
                                    <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                                        <CoinIcon
                                            type={coin.type}
                                            name={coinName}
                                            label=""
                                            symbol={coin.symbol}
                                            address={coinAddress ?? ''}
                                            logoURL={coin.image_url}
                                            size={20}
                                        />
                                    </Avatar>
                                </Linking>

                                <Typography className={classes.title} variant="h6">
                                    <Linking
                                        href={first(coin.home_urls)}
                                        LinkProps={{ className: classes.name, title: coinName }}>
                                        {coinName}
                                    </Linking>
                                    {coin.symbol ?
                                        <Typography component="span" className={classes.symbol}>
                                            (<em className={classes.symbolText}>{coin.symbol}</em>)
                                        </Typography>
                                    :   null}
                                </Typography>
                                {typeof coin.market_cap_rank === 'number' || result.rank ?
                                    <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                        <Trans>
                                            Rank #{result.rank?.toString() ?? coin.market_cap_rank?.toString() ?? ''}
                                        </Trans>
                                    </Typography>
                                :   null}
                                {(collectionList.length > 1 || (socialAccounts.length && rss3Key)) && !isPreciseSearch ?
                                    <>
                                        <IconButton
                                            sx={{ padding: 0 }}
                                            size="small"
                                            onClick={() => setWalletMenuOpen((v) => !v)}>
                                            <Icons.ArrowDrop size={24} className={classes.icon} />
                                        </IconButton>

                                        <TokenWithSocialGroupMenu
                                            disablePortal
                                            disableScrollLock={false}
                                            open={walletMenuOpen}
                                            onClose={closeMenu}
                                            anchorEl={titleRef.current}
                                            onAddressChange={openRss3Profile}
                                            collectionList={collectionList}
                                            socialAccounts={socialAccounts}
                                            currentCollection={result}
                                            onTokenChange={setResult}
                                        />
                                    </>
                                :   null}
                                <Box className={classes.buttons}>
                                    <ThemeProvider theme={MaskLightTheme}>
                                        {isSwappable ?
                                            <Button
                                                color="primary"
                                                size="small"
                                                endIcon={<Icons.Swap size={16} />}
                                                variant="roundedContained"
                                                onClick={onExchangeButtonClicked}>
                                                <Trans>Swap</Trans>
                                            </Button>
                                        :   null}
                                        {isBuyable ?
                                            <Button
                                                color="primary"
                                                size="small"
                                                endIcon={<Icons.Buy size={16} />}
                                                variant="roundedContained"
                                                onClick={onBuyButtonClicked}>
                                                <Trans>Buy Now</Trans>
                                            </Button>
                                        :   null}
                                        {isNFT && first(coin.home_urls) ?
                                            <Button
                                                color="primary"
                                                size="small"
                                                endIcon={<Icons.LinkOut size={16} />}
                                                variant="roundedContained"
                                                onClick={() => window.open(first(coin.home_urls))}>
                                                <Trans>Open</Trans>
                                            </Button>
                                        :   null}
                                    </ThemeProvider>
                                </Box>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" marginTop={2}>
                                <Stack direction="row" gap={1} alignItems="center">
                                    {market ?
                                        <Typography
                                            fontSize={18}
                                            fontWeight={500}
                                            lineHeight="24px"
                                            color={theme.palette.maskColor.dark}>
                                            {isNFT ?
                                                <>
                                                    <Trans>Floor Price</Trans>:{' '}
                                                </>
                                            :   null}
                                            {floorPrice ?
                                                formatCurrency(floorPrice, isNFT ? market.price_symbol : 'USD')
                                            :   '--'}
                                        </Typography>
                                    :   <Typography fontSize={14} fontWeight={500} lineHeight="24px">
                                            <Trans>No Data</Trans>
                                        </Typography>
                                    }
                                    {isNFT && !isSpam ?
                                        <IconButton onClick={promptReport} disabled={isReporting}>
                                            {isReporting ?
                                                <LoadingBase size={16} />
                                            :   <Icons.Flag size={16} color={theme.palette.maskColor.dark} />}
                                        </IconButton>
                                    :   null}
                                    {market && !isNFT ?
                                        <PriceChange
                                            change={
                                                market.price_change_percentage_24h_in_currency ||
                                                market.price_change_24h ||
                                                0
                                            }
                                        />
                                    :   null}
                                </Stack>
                                {isNFT && isSpam ?
                                    <NFTSpamBadge />
                                : isTokenSecurityEnable && tokenSecurity && !error ?
                                    <TokenSecurityBar tokenSecurity={tokenSecurity} />
                                :   null}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            <CardContent className={classes.content}>
                <Paper className={classes.body} elevation={0}>
                    {children}
                    {(isCollectionProjectPopper || isTokenTagPopper) && currentTab === ContentTab.Market ?
                        <Stack style={{ height: 48, width: '100%', background: theme.palette.maskColor.bottom }} />
                    :   null}
                </Paper>
                {isCollectionProjectPopper || isTokenTagPopper ?
                    <section className={classes.pluginDescriptorWrapper}>
                        <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                    </section>
                :   null}
            </CardContent>
        </TrendingCard>
    )
}
