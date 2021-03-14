import { useCallback } from 'react'
import {
    Avatar,
    Button,
    CardActions,
    CardContent,
    CardHeader,
    createStyles,
    IconButton,
    Link,
    makeStyles,
    Paper,
    Typography,
} from '@material-ui/core'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import stringify from 'json-stable-stringify'
import { findIndex, first, last } from 'lodash-es'
import { Coin, Currency, DataProvider, Stat, TradeProvider, Trending } from '../../types'
import { resolveDataProviderName, resolveTradeProviderName } from '../../pipes'
import { formatCurrency } from '../../../Wallet/formatter'
import { PriceChanged } from './PriceChanged'
import { Linking } from './Linking'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import { TrendingCard, TrendingCardProps } from './TrendingCard'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../Transak/messages'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Flags } from '../../../../utils/flags'
import { TokenIcon } from '../../../../extension/options-page/DashboardComponents/TokenIcon'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { FootnoteMenu, FootnoteMenuOption } from '../trader/FootnoteMenu'
import { getEnumAsArray } from '../../../../utils/enum'
import { TradeProviderIcon } from '../trader/TradeProviderIcon'
import { DataProviderIcon } from '../trader/DataProviderIcon'
import {
    currentDataProviderSettings,
    currentTradeProviderSettings,
    getCurrentPreferredCoinIdSettings,
} from '../../settings'
import { CoinMenu, CoinMenuOption } from './CoinMenu'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin'
import { useApprovedTokens } from '../../trending/useApprovedTokens'
import { CoinSaftyAlert } from './CoinSaftyAlert'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
        body: {},
        footer: {
            justifyContent: 'space-between',
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
        footnote: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            marginRight: theme.spacing(0.5),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        footMenu: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
        },
        footName: {
            marginLeft: theme.spacing(0.5),
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
    })
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
    } = props
    const { coin, market } = trending

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region buy
    const account = useAccount()
    const isAllowanceCoin = useTransakAllowanceCoin(coin)
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)

    const onBuyButtonClicked = useCallback(() => {
        setBuyDialogOpen({
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

    const dataProviderOptions = getEnumAsArray(DataProvider)
    const tradeProviderOptions = getEnumAsArray(TradeProvider)
    const { approvedTokens, onApprove } = useApprovedTokens(trending.coin.eth_address)
    return (
        <TrendingCard {...TrendingCardProps}>
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={first(coin.home_urls)}>
                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                            {trending.coin.eth_address ? (
                                <TokenIcon
                                    classes={{ icon: classes.avatarFallback }}
                                    address={trending.coin.eth_address}
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

                        {account && trending.coin.symbol && isAllowanceCoin && Flags.transak_enabled ? (
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
                                        <span className={classes.rank} title="Market Cap Rank">
                                            #{coin.market_cap_rank}
                                        </span>
                                    ) : null}
                                    <span>
                                        {formatCurrency(
                                            (dataProvider === DataProvider.COIN_MARKET_CAP
                                                ? last(stats)?.[1] ?? market.current_price
                                                : market.current_price) ?? 0,
                                            currency.symbol,
                                        )}
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

            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>Powered by </span>
                    <Link
                        className={classes.footLink}
                        color="textSecondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                {showDataProviderIcon ? (
                    <div className={classes.footMenu}>
                        <Typography className={classes.footnote}>Data Source</Typography>
                        <FootnoteMenu
                            options={dataProviderOptions.map((x) => ({
                                name: (
                                    <>
                                        <DataProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveDataProviderName(x.value)}</span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(dataProviderOptions, (x) => x.value === dataProvider)}
                            onChange={onDataProviderChange}
                        />
                        <ArrowDropDownIcon />
                    </div>
                ) : null}
                {showTradeProviderIcon ? (
                    <div className={classes.footMenu}>
                        <Typography className={classes.footnote}>Supported by</Typography>
                        <FootnoteMenu
                            options={tradeProviderOptions.map((x) => ({
                                name: (
                                    <>
                                        <TradeProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveTradeProviderName(x.value)}</span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(getEnumAsArray(TradeProvider), (x) => x.value === tradeProvider)}
                            onChange={onTradeProviderChange}>
                            <ArrowDropDownIcon />
                        </FootnoteMenu>
                    </div>
                ) : null}
            </CardActions>
        </TrendingCard>
    )
}
