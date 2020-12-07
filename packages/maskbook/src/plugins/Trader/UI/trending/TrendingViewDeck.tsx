import { useCallback } from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    CardHeader,
    CardContent,
    CardActions,
    createStyles,
    Link,
    Paper,
    Button,
    IconButton,
} from '@material-ui/core'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import { findIndex, first, last } from 'lodash-es'
import { Currency, DataProvider, Stat, TradeProvider, Trending } from '../../types'
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
import { currentDataProviderSettings, currentTradeProviderSettings } from '../../settings'
import { ArrowDropDown } from '@material-ui/icons'

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
        tabs: {
            height: 35,
            width: '100%',
            minHeight: 'unset',
        },
        tab: {
            minHeight: 'unset',
            minWidth: 'unset',
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
        currency: {
            marginRight: theme.spacing(1),
        },
        percentage: {
            marginLeft: theme.spacing(1),
        },
        maskbook: {
            width: 40,
            height: 10,
        },
    })
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content'> {
    stats: Stat[]
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

    //#region select dup coins
    const onClickDrop = useCallback(() => {}, [])
    //#endregion

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
                            <Linking href={first(coin.home_urls)} LinkProps={{ title: coin.name.toUpperCase() }}>
                                {coin.name.toUpperCase()}
                            </Linking>
                            <span className={classes.symbol}>({coin.symbol.toUpperCase()})</span>
                        </Typography>
                        <IconButton size="small" onClick={onClickDrop}>
                            <ArrowDropDown />
                        </IconButton>
                        {account && trending.coin.symbol && Flags.transak_enabled ? (
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
                                            dataProvider === DataProvider.COIN_MARKET_CAP
                                                ? last(stats)?.[1] ?? market.current_price
                                                : market.current_price,
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
                        title="Mask Network"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                {showDataProviderIcon ? (
                    <div className={classes.footMenu}>
                        <Typography className={classes.footnote}>Data Source</Typography>
                        <FootnoteMenu
                            options={getEnumAsArray(DataProvider).map((x) => ({
                                name: (
                                    <>
                                        <DataProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveDataProviderName(x.value)}</span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(getEnumAsArray(DataProvider), (x) => x.value === dataProvider)}
                            onChange={onDataProviderChange}
                        />
                    </div>
                ) : null}
                {showTradeProviderIcon ? (
                    <div className={classes.footMenu}>
                        <Typography className={classes.footnote}>Supported by</Typography>
                        <FootnoteMenu
                            options={getEnumAsArray(TradeProvider).map((x) => ({
                                name: (
                                    <>
                                        <TradeProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveTradeProviderName(x.value)}</span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(getEnumAsArray(TradeProvider), (x) => x.value === tradeProvider)}
                            onChange={onTradeProviderChange}
                        />
                    </div>
                ) : null}
            </CardActions>
        </TrendingCard>
    )
}
