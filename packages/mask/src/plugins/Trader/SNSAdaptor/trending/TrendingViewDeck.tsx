import { ArrowDropIcon, BuyIcon } from '@masknet/icons'
import { PluginId, useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useAccount } from '@masknet/plugin-infra/web3'
import { DataProvider } from '@masknet/public-api'
import { FormattedCurrency, Linking, TokenSecurityBar, useTokenSecurity } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { TrendingAPI, TrendingCoinType } from '@masknet/web3-providers'
import { formatCurrency, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Avatar, Button, CardContent, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import stringify from 'json-stable-stringify'
import { first, last } from 'lodash-unified'
import { useCallback, useRef, useState } from 'react'
import { useI18N } from '../../../../utils'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin'
import { PluginTransakMessages } from '../../../Transak/messages'
import { getCurrentPreferredCoinIdSettings } from '../../settings'
import { setStorage } from '../../storage'
import type { Coin, Currency, Stat } from '../../types'
import type { FootnoteMenuOption } from '../trader/components/FootnoteMenuUI'
import { TradeDataSource } from '../trader/TradeDataSource'
import { CoinMenu } from './CoinMenu'
import { CoinSafetyAlert } from './CoinSafetyAlert'
import { CoinIcon } from './components'
import { PluginHeader } from './PluginHeader'
import { PriceChanged } from './PriceChanged'
import { TrendingCard, TrendingCardProps } from './TrendingCard'

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

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content' | 'cardHeader'> {
    keyword: string
    stats: Stat[]
    coins: Coin[]
    currency: Currency
    trending: TrendingAPI.Trending
    dataProvider: DataProvider
    children?: React.ReactNode
    showDataProviderIcon?: boolean
    TrendingCardProps?: Partial<TrendingCardProps>
    dataProviders: DataProvider[]
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        keyword,
        coins,
        trending,
        dataProvider,
        stats,
        children,
        showDataProviderIcon = false,
        TrendingCardProps,
        dataProviders = EMPTY_LIST,
    } = props
    const { coin, market } = trending

    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useStyles(), props)

    const isNFT = coin.type === TrendingCoinType.NonFungible

    // #region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor('any').some((x) => x.ID === PluginId.Transak)
    const transakIsMinimalMode = useIsMinimalMode(PluginId.Transak)

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const isAllowanceCoin = useTransakAllowanceCoin({ address: coin.contract_address, symbol: coin.symbol })
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const isTokenSecurityEnable = !isNFT && !snsAdaptorMinimalPlugins.map((x) => x.ID).includes(PluginId.GoPlusSecurity)

    const { value: tokenSecurityInfo, error } = useTokenSecurity(
        coin?.chainId ?? ChainId.Mainnet,
        coin.contract_address?.trim(),
        isTokenSecurityEnable,
    )

    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            // @ts-ignore
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
        (type: TrendingCoinType, value: string) => {
            const settings = JSON.parse(currentPreferredCoinIdSettings) as Record<string, string>
            const coin = coins.find((x) => x.id === value && x.type === type)
            if (!coin) return
            settings[keyword] = value
            getCurrentPreferredCoinIdSettings(dataProvider).value = stringify(settings)
        },
        [dataProvider, keyword, coins, currentPreferredCoinIdSettings],
    )
    // #endregion
    const titleRef = useRef<HTMLElement>(null)
    const [coinMenuOpen, setCoinMenuOpen] = useState(false)

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
                    <Stack gap={2} flexGrow={1}>
                        <Stack flexDirection="row">
                            {typeof coin.market_cap_rank === 'number' ? (
                                <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                    {t('plugin_trader_rank', { rank: coin.market_cap_rank })}
                                </Typography>
                            ) : null}
                            <Box flex={1} />
                        </Stack>
                        <Stack>
                            <Stack flexDirection="row" alignItems="center" gap={0.5} ref={titleRef}>
                                <Linking href={first(coin.home_urls)}>
                                    <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                                        <CoinIcon
                                            type={trending.coin.type}
                                            address={trending.coin.address}
                                            name={trending.coin.name}
                                            logoUrl={trending.coin.image_url}
                                            size={20}
                                        />
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
                                    <>
                                        <IconButton
                                            sx={{ padding: 0 }}
                                            size="small"
                                            onClick={() => setCoinMenuOpen((v) => !v)}>
                                            <ArrowDropIcon />
                                        </IconButton>
                                        <CoinMenu
                                            open={coinMenuOpen}
                                            anchorEl={titleRef.current}
                                            options={coins.map((coin) => ({
                                                coin,
                                                value: coin.id,
                                            }))}
                                            value={coins.find((x) => x.id === coin.id)?.id}
                                            type={coin.type}
                                            onChange={onCoinMenuChange}
                                            onClose={() => setCoinMenuOpen(false)}
                                        />
                                    </>
                                ) : null}
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Stack direction="row" gap={1} alignItems="center">
                                    {market ? (
                                        <Typography
                                            fontSize={18}
                                            fontWeight={500}
                                            lineHeight="24px"
                                            color={theme.palette.maskColor.dark}>
                                            {isNFT ? `${t('plugin_trader_floor_price')}: ` : null}
                                            <FormattedCurrency
                                                value={
                                                    (dataProvider === DataProvider.COIN_MARKET_CAP
                                                        ? last(stats)?.[1] ?? market.current_price
                                                        : market.current_price) ?? 0
                                                }
                                                sign={isNFT ? 'ETH' : 'USD'}
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
                                {isTokenSecurityEnable && tokenSecurityInfo && !error && (
                                    <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack>
                        {transakPluginEnabled && !transakIsMinimalMode && trending.coin.symbol && isAllowanceCoin ? (
                            <Button
                                style={{
                                    background: theme.palette.maskColor.dark,
                                    color: theme.palette.maskColor.white,
                                }}
                                size="small"
                                startIcon={<BuyIcon style={{ fontSize: 16 }} />}
                                variant="contained"
                                onClick={onBuyButtonClicked}>
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
