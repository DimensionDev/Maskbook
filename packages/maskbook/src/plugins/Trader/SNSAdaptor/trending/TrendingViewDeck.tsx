import { useCallback } from 'react'
import { Avatar, Button, CardContent, CardHeader, IconButton, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import stringify from 'json-stable-stringify'
import { first, last } from 'lodash-es'
import { FormattedCurrency, useValueRef, useRemoteControlledDialog, useStylesExtends, TokenIcon } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import type { Coin, Currency, Stat, Trending } from '../../types'
import { DataProvider, TradeProvider } from '@masknet/public-api'
import { PriceChanged } from './PriceChanged'
import { Linking } from './Linking'
import { TrendingCard, TrendingCardProps } from './TrendingCard'
import { PluginTransakMessages } from '../../../Transak/messages'
import { useAccount } from '@masknet/web3-shared'
import type { FootnoteMenuOption } from '../trader/FootnoteMenu'
import { TradeFooter } from '../trader/TradeFooter'
import {
    currentDataProviderSettings,
    currentTradeProviderSettings,
    getCurrentPreferredCoinIdSettings,
} from '../../settings'
import { CoinMenu, CoinMenuOption } from './CoinMenu'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin'
import { CoinSaftyAlert } from './CoinSaftyAlert'
import { PLUGIN_IDENTIFIER as TRANSAK_PLUGIN_ID } from '../../../Transak/constants'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            boxShadow: 'none',
            borderRadius: 0,
            marginBottom: theme.spacing(2),
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        content: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        header: {
            display: 'flex',
            position: 'relative',
        },
        headline: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
        },
        title: {
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
        },
        name: {
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        symbol: {
            fontSize: 12,
            color: theme.palette.text.secondary,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
        },
        buy: {
            right: 0,
            position: 'absolute',
        },
        arrowIcon: {
            color: theme.palette.text.primary,
        },
        rank: {
            color: theme.palette.text.secondary,
            fontWeight: 300,
            marginRight: theme.spacing(1),
        },
        avatar: {
            backgroundColor: theme.palette.common.white,
        },
        avatarFallback: {
            width: 40,
            height: 40,
        },
        maskbook: {
            width: 40,
            height: 10,
        },
    }
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content'> {
    stats: Stat[]
    coins: Coin[]
    currency: Currency
    trending: Trending
    dataProvider: DataProvider
    tradeProvider: TradeProvider
    children?: React.ReactNode
    showDataProviderIcon?: boolean
    showTradeProviderIcon?: boolean
    TrendingCardProps?: Partial<TrendingCardProps>
    dataProviders: DataProvider[]
    tradeProviders: TradeProvider[]
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        coins,
        currency,
        trending,
        dataProvider,
        tradeProvider,
        stats,
        children,
        showDataProviderIcon = false,
        showTradeProviderIcon = false,
        TrendingCardProps,
        dataProviders = [],
        tradeProviders = [],
    } = props
    const { coin, market } = trending

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor().find((x) => x.ID === TRANSAK_PLUGIN_ID)
    const account = useAccount()
    const isAllowanceCoin = useTransakAllowanceCoin(coin)
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, trending?.coin?.symbol])
    //#endregion

    //#region sync with settings
    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentDataProviderSettings.value = option.value as DataProvider
    }, [])
    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])
    //#endregion

    //#region switch between coins with the same symbol
    const currentPreferredCoinIdSettings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))
    const onCoinMenuChange = useCallback(
        (option: CoinMenuOption) => {
            const settings = JSON.parse(currentPreferredCoinIdSettings) as Record<string, string>
            settings[option.coin.symbol.toLowerCase()] = option.value
            getCurrentPreferredCoinIdSettings(dataProvider).value = stringify(settings)
        },
        [dataProvider, currentPreferredCoinIdSettings],
    )
    //#endregion

    return (
        <TrendingCard {...TrendingCardProps}>
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={first(coin.home_urls)}>
                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                            {trending.coin.contract_address ? (
                                <TokenIcon
                                    classes={{ icon: classes.avatarFallback }}
                                    address={trending.coin.contract_address}
                                />
                            ) : null}
                        </Avatar>
                    </Linking>
                }
                title={
                    <div className={classes.headline}>
                        <Typography className={classes.title} variant="h6">
                            <Linking
                                href={first(coin.home_urls)}
                                LinkProps={{ className: classes.name, title: coin.name.toUpperCase() }}>
                                {coin.name.toUpperCase()}
                            </Linking>
                            <span className={classes.symbol}>({coin.symbol.toUpperCase()})</span>
                        </Typography>

                        {coins.length > 1 ? (
                            <CoinMenu
                                options={coins.map((coin) => ({
                                    coin,
                                    value: coin.id,
                                }))}
                                selectedIndex={coins.findIndex((x) => x.id === coin.id)}
                                onChange={onCoinMenuChange}>
                                <IconButton className={classes.arrowIcon} size="small">
                                    <ArrowDropDownIcon />
                                </IconButton>
                            </CoinMenu>
                        ) : null}

                        {transakPluginEnabled && account && trending.coin.symbol && isAllowanceCoin ? (
                            <Button
                                className={classes.buy}
                                startIcon={<MonetizationOnOutlinedIcon />}
                                variant="text"
                                color="primary"
                                onClick={onBuyButtonClicked}>
                                {t('buy_now')}
                            </Button>
                        ) : null}
                    </div>
                }
                subheader={
                    <>
                        <Typography component="p" variant="body1">
                            {market ? (
                                <>
                                    {typeof coin.market_cap_rank === 'number' ? (
                                        <span className={classes.rank} title="Index Cap Rank">
                                            #{coin.market_cap_rank}
                                        </span>
                                    ) : null}
                                    <span>
                                        <FormattedCurrency
                                            value={
                                                (dataProvider === DataProvider.COIN_MARKET_CAP
                                                    ? last(stats)?.[1] ?? market.current_price
                                                    : market.current_price) ?? 0
                                            }
                                            sign={currency.symbol}
                                        />
                                    </span>
                                </>
                            ) : (
                                <span>{t('plugin_trader_no_data')}</span>
                            )}
                            <PriceChanged
                                amount={market?.price_change_percentage_1h ?? market?.price_change_percentage_24h ?? 0}
                            />
                        </Typography>
                    </>
                }
                disableTypography
            />
            <CardContent className={classes.content}>
                {dataProvider === DataProvider.UNISWAP_INFO && <CoinSaftyAlert coin={trending.coin} />}
                <Paper className={classes.body} elevation={0}>
                    {children}
                </Paper>
            </CardContent>

            <TradeFooter
                classes={{
                    footer: classes.footer,
                }}
                showDataProviderIcon={showDataProviderIcon}
                showTradeProviderIcon={showTradeProviderIcon}
                dataProvider={dataProvider}
                tradeProvider={tradeProvider}
                dataProviders={dataProviders}
                tradeProviders={tradeProviders}
                onDataProviderChange={onDataProviderChange}
                onTradeProviderChange={onTradeProviderChange}
            />
        </TrendingCard>
    )
}
