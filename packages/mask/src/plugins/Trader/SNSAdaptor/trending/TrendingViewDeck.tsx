import { useCallback } from 'react'
import { Avatar, Button, CardContent, IconButton, Paper, Stack, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
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
import { TradeDataSource } from '../trader/TradeDataSource'
import { getCurrentPreferredCoinIdSettings } from '../../settings'
import { CoinMenu, CoinMenuOption } from './CoinMenu'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin'
import { CoinSafetyAlert } from './CoinSafetyAlert'
import { PluginId, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useAccount } from '@masknet/plugin-infra/web3'
import { formatCurrency, NetworkPluginID } from '@masknet/web3-shared-base'
import { setStorage } from '../../storage'
import { PluginHeader } from './PluginHeader'
import { Box } from '@mui/system'
import { ArrowDropIcon, BuyIcon } from '@masknet/icons'
import { TrendingTokenSecurity } from './TrendingTokenSecurity'

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
            position: 'relative',
            top: '-36px',
            paddingTop: 0,
            paddingBottom: '0 !important',
        },
        cardHeader: {
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(6.5),
            background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        header: {
            display: 'flex',
            position: 'relative',
        },
        headline: {
            marginTop: 30,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
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
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor?.dark,
        },
        symbol: {
            fontWeight: 700,
            fontSize: 18,
            color: theme.palette.maskColor?.dark,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
        },
        buy: {},
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
            backgroundColor: theme.palette.common.white,
        },
        avatarFallback: {
            width: 24,
            height: 24,
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
            // TODO: fix it
            // code: coin.symbol,
            // address: account,
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
            <Stack className={classes.cardHeader}>
                <PluginHeader>
                    <TradeDataSource
                        showDataProviderIcon={showDataProviderIcon}
                        dataProvider={dataProvider}
                        dataProviders={dataProviders}
                        onDataProviderChange={onDataProviderChange}
                    />
                </PluginHeader>
                <Stack className={classes.headline}>
                    <Stack gap={2}>
                        <Stack flexDirection="row">
                            {typeof coin.market_cap_rank === 'number' ? (
                                <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                    {t('plugin_trader_rank', { rank: coin.market_cap_rank })}
                                </Typography>
                            ) : null}
                            <Box flex={1} />
                        </Stack>
                        <Stack>
                            <Stack flexDirection="row" alignItems="center" gap={0.5}>
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
                                <Typography className={classes.title} variant="h6">
                                    <Linking
                                        href={first(coin.home_urls)}
                                        LinkProps={{ className: classes.name, title: coin.name.toUpperCase() }}>
                                        {coin.name.toUpperCase()}
                                    </Linking>
                                    <Typography component="span" className={classes.symbol}>
                                        ({coin.symbol.toUpperCase()})
                                    </Typography>
                                </Typography>
                                {coins.length > 1 ? (
                                    <CoinMenu
                                        options={coins.map((coin) => ({
                                            coin,
                                            value: coin.id,
                                        }))}
                                        selectedIndex={coins.findIndex((x) => x.id === coin.id)}
                                        onChange={onCoinMenuChange}>
                                        <IconButton sx={{ padding: 0 }} size="small">
                                            <ArrowDropIcon />
                                        </IconButton>
                                    </CoinMenu>
                                ) : null}
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Stack direction="row" gap={1} alignItems="center">
                                    {market ? (
                                        <Typography fontSize={18} fontWeight={500} lineHeight="24px">
                                            <FormattedCurrency
                                                value={
                                                    (dataProvider === DataProvider.COIN_MARKET_CAP
                                                        ? last(stats)?.[1] ?? market.current_price
                                                        : market.current_price) ?? 0
                                                }
                                                formatter={formatCurrency}
                                            />
                                        </Typography>
                                    ) : (
                                        <Typography fontSize={14} fontWeight={500} lineHeight="24px">
                                            {t('plugin_trader_no_data')}
                                        </Typography>
                                    )}
                                    <PriceChanged
                                        amount={
                                            market?.price_change_percentage_1h ??
                                            market?.price_change_percentage_24h ??
                                            0
                                        }
                                    />
                                </Stack>
                                <TrendingTokenSecurity />
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack>
                        {transakPluginEnabled && account && trending.coin.symbol && isAllowanceCoin ? (
                            <Button startIcon={<BuyIcon />} variant="contained" onClick={onBuyButtonClicked}>
                                {t('buy_now')}
                            </Button>
                        ) : null}
                    </Stack>
                </Stack>
            </Stack>
            <CardContent className={classes.content}>
                {dataProvider === DataProvider.UNISWAP_INFO && <CoinSafetyAlert coin={trending.coin} />}
                <Paper className={classes.body} elevation={0}>
                    {children}
                </Paper>
            </CardContent>
        </TrendingCard>
    )
}
