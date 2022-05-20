import { useCallback } from 'react'
import { Avatar, Button, CardContent, CardHeader, IconButton, Paper, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import stringify from 'json-stable-stringify'
import { first, last } from 'lodash-unified'
import { FormattedCurrency, TokenIcon } from '@masknet/shared'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils'
import type { Coin, Currency, Stat, Trending } from '../../types'
import { DataProvider } from '@masknet/public-api'
import { PriceChanged } from './PriceChanged'
import { Linking } from './Linking'
import { TrendingCard, TrendingCardProps } from './TrendingCard'
import { PluginTransakMessages } from '../../../Transak/messages'
import type { FootnoteMenuOption } from '../trader/FootnoteMenu'
import { TradeFooter } from '../trader/TradeFooter'
import { getCurrentPreferredCoinIdSettings } from '../../settings'
import { CoinMenu, CoinMenuOption } from './CoinMenu'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin'
import { CoinSafetyAlert } from './CoinSafetyAlert'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useAccount } from '@masknet/plugin-infra/web3'
import { formatCurrency, NetworkPluginID } from '@masknet/web3-shared-base'
import { setStorage } from '../../storage'

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
    }
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content'> {
    stats: Stat[]
    coins: Coin[]
    currency: Currency
    trending: Trending
    dataProvider: DataProvider
    children?: React.ReactNode
    showDataProviderIcon?: boolean
    TrendingCardProps?: Partial<TrendingCardProps>
    dataProviders: DataProvider[]
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        coins,
        currency,
        trending,
        dataProvider,
        stats,
        children,
        showDataProviderIcon = false,
        TrendingCardProps,
        dataProviders = [],
    } = props
    const { coin, market } = trending

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    // #region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor('any').find((x) => x.ID === PluginId.Transak)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const isAllowanceCoin = useTransakAllowanceCoin(coin)
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, trending?.coin?.symbol])
    // #endregion

    // #region sync with settings
    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setStorage(option.value as DataProvider)
    }, [])
    // #endregion

    // #region switch between coins with the same symbol
    const currentPreferredCoinIdSettings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))
    const onCoinMenuChange = useCallback(
        (option: CoinMenuOption) => {
            const settings = JSON.parse(currentPreferredCoinIdSettings) as Record<string, string>
            settings[option.coin.symbol.toLowerCase()] = option.value
            getCurrentPreferredCoinIdSettings(dataProvider).value = stringify(settings)
        },
        [dataProvider, currentPreferredCoinIdSettings],
    )
    // #endregion

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
                                            formatter={formatCurrency}
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
                {dataProvider === DataProvider.UNISWAP_INFO && <CoinSafetyAlert coin={trending.coin} />}
                <Paper className={classes.body} elevation={0}>
                    {children}
                </Paper>
            </CardContent>

            <TradeFooter
                classes={{
                    footer: classes.footer,
                }}
                showDataProviderIcon={showDataProviderIcon}
                dataProvider={dataProvider}
                dataProviders={dataProviders}
                onDataProviderChange={onDataProviderChange}
            />
        </TrendingCard>
    )
}
