import { Icons } from '@masknet/icons'
import { useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PluginTransakMessages, useTransakAllowanceCoin } from '@masknet/plugin-transak'
import {
    Linking,
    TokenSecurityBar,
    useTokenSecurity,
    useSocialAccountsBySettings,
    TokenWithSocialGroupMenu,
    useTokenMenuCollectionList,
} from '@masknet/shared'
import { NetworkPluginID, PluginID, EMPTY_LIST, EnhanceableSite, CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { MaskColors, MaskDarkTheme, MaskLightTheme, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType, TokenType, formatCurrency, SocialIdentity } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import {
    Avatar,
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
import { useCallback, useContext, useRef, useState } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { ContentTabs, Currency, Stat } from '../../types/index.js'
import { PriceChanged } from './PriceChanged.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'
import { TrendingViewDescriptor } from './TrendingViewDescriptor.js'
import { CoinIcon } from './components/index.js'
import { TrendingViewContext } from './context.js'
import { SNS_RSS3_FIELD_KEY_MAP } from '../../../ProfileCard/constants.js'

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
            color: theme.palette.maskColor?.dark,
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
            color: theme.palette.maskColor?.white,
            fontWeight: 400,
            fontSize: 10,
            background: theme.palette.maskColor?.dark,
            borderRadius: theme.spacing(0.5),
        },
        avatar: {
            width: 24,
            height: 24,
            fontSize: 10,
            backgroundColor: theme.palette.common.white,
        },
        buyButton: {
            marginLeft: 'auto',
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
            background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            boxSizing: 'border-box',
            borderBottomRightRadius: '16px',
            borderBottomLeftRadius: '16px',
            zIndex: 2,
        },
    }
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content' | 'cardHeader'> {
    stats: Stat[]
    currency: Currency
    currentTab: ContentTabs
    trending: TrendingAPI.Trending
    identity?: SocialIdentity
    setActive?: (x: boolean) => void
    setResult: (a: Web3Helper.TokenResultAll) => void
    result: Web3Helper.TokenResultAll
    resultList?: Web3Helper.TokenResultAll[]
    children?: React.ReactNode
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        trending,
        stats,
        children,
        TrendingCardProps,
        resultList = [],
        result,
        setResult,
        setActive,
        currentTab,
        identity,
    } = props

    const { coin, market } = trending
    const [walletMenuOpen, setWalletMenuOpen] = useState(false)
    const { isCollectionProjectPopper, isTokenTagPopper, isPreciseSearch, badgeBounding } =
        useContext(TrendingViewContext)

    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles({ isTokenTagPopper, isCollectionProjectPopper }, { props })
    const isNFT = coin.type === TokenType.NonFungible

    // #region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor('any').some((x) => x.ID === PluginID.Transak)
    const transakIsMinimalMode = useIsMinimalMode(PluginID.Transak)

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isAllowanceCoin = useTransakAllowanceCoin({ address: coin.contract_address, symbol: coin.symbol })
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const isTokenSecurityEnable = !isNFT && !snsAdaptorMinimalPlugins.map((x) => x.ID).includes(PluginID.GoPlusSecurity)

    const { value: tokenSecurityInfo, error } = useTokenSecurity(
        coin.chainId ?? ChainId.Mainnet,
        coin.contract_address?.trim(),
        isTokenSecurityEnable,
    )

    const isBuyable = !isNFT && transakPluginEnabled && !transakIsMinimalMode && coin.symbol && isAllowanceCoin
    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, coin.symbol])
    // #endregion

    const titleRef = useRef<HTMLElement>(null)

    const coinAddress = coin.address || coin.contract_address
    const coinName = result.name || coin.name

    const collectionList = useTokenMenuCollectionList(resultList, result)

    const rss3Key = SNS_RSS3_FIELD_KEY_MAP[identity?.identifier?.network as EnhanceableSite]
    const { value: socialAccounts = EMPTY_LIST } = useSocialAccountsBySettings(identity)

    const openRss3Profile = useCallback(
        (address: string) => {
            if (!isCollectionProjectPopper) {
                return CrossIsolationMessages.events.hideSearchResultInspectorEvent.sendToLocal({ hide: true })
            }

            if (!identity?.identifier?.userId || !badgeBounding) return

            CrossIsolationMessages.events.profileCardEvent.sendToLocal({
                open: true,
                userId: identity?.identifier?.userId,
                badgeBounding,
                address,
                openFromTrendingCard: true,
            })

            setActive?.(false)
        },
        [JSON.stringify(identity), isCollectionProjectPopper, badgeBounding],
    )
    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.cardHeader}>
                {isCollectionProjectPopper || isTokenTagPopper ? null : (
                    <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                )}
                <Stack className={classes.headline}>
                    <Stack gap={2} flexGrow={1}>
                        <Stack>
                            <Stack flexDirection="row" alignItems="center" gap={0.5} ref={titleRef}>
                                <Linking href={first(coin.home_urls)}>
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
                                    {coin.symbol ? (
                                        <Typography component="span" className={classes.symbol}>
                                            (<em className={classes.symbolText}>{coin.symbol}</em>)
                                        </Typography>
                                    ) : null}
                                </Typography>
                                {typeof coin.market_cap_rank === 'number' || result.rank ? (
                                    <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                        {t('plugin_trader_rank', { rank: result.rank ?? coin.market_cap_rank })}
                                    </Typography>
                                ) : null}
                                {(collectionList.length > 1 || (socialAccounts.length && rss3Key)) &&
                                !isPreciseSearch ? (
                                    <>
                                        <IconButton
                                            sx={{ padding: 0 }}
                                            size="small"
                                            onClick={() => setWalletMenuOpen((v) => !v)}>
                                            <Icons.ArrowDrop size={24} className={classes.icon} />
                                        </IconButton>
                                        <ThemeProvider
                                            theme={theme.palette.mode === 'light' ? MaskLightTheme : MaskDarkTheme}>
                                            <TokenWithSocialGroupMenu
                                                disablePortal={false}
                                                disableScrollLock={false}
                                                walletMenuOpen={walletMenuOpen}
                                                setWalletMenuOpen={setWalletMenuOpen}
                                                containerRef={titleRef}
                                                onAddressChange={openRss3Profile}
                                                collectionList={collectionList}
                                                socialAccounts={socialAccounts}
                                                currentCollection={result}
                                                onTokenChange={setResult}
                                            />
                                        </ThemeProvider>
                                    </>
                                ) : null}
                                <ThemeProvider theme={MaskLightTheme}>
                                    {isBuyable ? (
                                        <Button
                                            color="primary"
                                            className={classes.buyButton}
                                            size="small"
                                            startIcon={<Icons.Buy size={16} />}
                                            variant="contained"
                                            onClick={onBuyButtonClicked}>
                                            {t('buy_now')}
                                        </Button>
                                    ) : null}
                                    {isNFT ? (
                                        <Button
                                            color="primary"
                                            className={classes.buyButton}
                                            size="small"
                                            endIcon={<Icons.LinkOut size={16} />}
                                            variant="roundedContained"
                                            onClick={() => window.open(first(coin.home_urls))}>
                                            {t('open')}
                                        </Button>
                                    ) : null}
                                </ThemeProvider>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" marginTop={2}>
                                <Stack direction="row" gap={1} alignItems="center">
                                    {market ? (
                                        <Typography
                                            fontSize={18}
                                            fontWeight={500}
                                            lineHeight="24px"
                                            color={theme.palette.maskColor.dark}>
                                            {isNFT ? `${t('plugin_trader_floor_price')}: ` : null}
                                            {formatCurrency(
                                                (trending.dataProvider === SourceType.CoinMarketCap
                                                    ? last(stats)?.[1] ?? market.current_price
                                                    : market.current_price) ?? 0,
                                                isNFT ? market.price_symbol : 'USD',
                                            )}
                                        </Typography>
                                    ) : (
                                        <Typography fontSize={14} fontWeight={500} lineHeight="24px">
                                            {t('plugin_trader_no_data')}
                                        </Typography>
                                    )}
                                    {isNFT ? null : (
                                        <PriceChanged
                                            amount={
                                                market?.price_change_percentage_1h_in_currency ??
                                                market?.price_change_24h ??
                                                0
                                            }
                                        />
                                    )}
                                </Stack>
                                {isTokenSecurityEnable && tokenSecurityInfo && !error && !isNFT && (
                                    <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            <CardContent className={classes.content}>
                <Paper className={classes.body} elevation={0}>
                    {children}
                    {(isCollectionProjectPopper || isTokenTagPopper) && currentTab === ContentTabs.Market ? (
                        <Stack style={{ height: 48, width: '100%' }} />
                    ) : null}
                </Paper>
                {(isCollectionProjectPopper || isTokenTagPopper) && currentTab !== ContentTabs.Swap ? (
                    <section className={classes.pluginDescriptorWrapper}>
                        <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                    </section>
                ) : null}
            </CardContent>
        </TrendingCard>
    )
}
