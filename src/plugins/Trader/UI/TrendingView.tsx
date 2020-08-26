import React, { useState } from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Theme,
    createStyles,
    Link,
    Box,
    Paper,
    Tab,
    Tabs,
} from '@material-ui/core'
import { resolvePlatformName, Platform } from '../type'
import { getActivatedUI } from '../../../social-network/ui'
import { formatCurrency } from '../../Wallet/formatter'
import { useTrending } from '../hooks/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChanged } from './PriceChanged'
import { PriceChart } from './PriceChart'
import { getEnumAsArray } from '../../../utils/enum'
import { Linking } from './Linking'
import { usePriceStats } from '../hooks/usePriceStats'
import { Skeleton } from '@material-ui/lab'
import { PriceChartDaysControl } from './PriceChartDaysControl'

const useStyles = makeStyles((theme: Theme) => {
    const internalName = getActivatedUI()?.internalName
    return createStyles({
        root: {
            width: 500,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            ...(internalName === 'twitter'
                ? { border: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#ccd6dd'}` }
                : null),
        },
        header: {
            display: 'flex',
            position: 'relative',
        },
        content: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        footer: {
            justifyContent: 'flex-end',
        },
        tabs: {
            width: 468,
        },
        section: {},
        description: {
            overflow: 'auto',
            maxHeight: '4.3em',
            wordBreak: 'break-word',
            marginBottom: theme.spacing(2),
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        rank: {
            color: theme.palette.text.primary,
            fontWeight: 300,
            marginRight: theme.spacing(1),
        },
        footnote: {
            fontSize: 10,
        },
        platform: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        avatar: {},
        percentage: {
            marginLeft: theme.spacing(1),
        },
    })
})

export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name: string
}

export function TrendingView(props: TrendingViewProps) {
    const classes = useStyles()

    const [tabIndex, setTabIndex] = useState(0)
    const { value: trending, loading } = useTrending(props.name)

    const [days, setDays] = useState(30)
    const { value: stats = [], loading: loadingStats } = usePriceStats({
        coinId: trending?.coin.id,
        platform: trending?.platform,
        currency: trending?.currency,
        days,
    })

    if (loading)
        return (
            <Card className={classes.root} elevation={0} component="article">
                <CardHeader
                    avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} />}
                    title={<Skeleton animation="wave" height={10} width="30%" />}
                    subheader={<Skeleton animation="wave" height={10} width="20%" />}
                />
                <CardContent className={classes.content}>
                    <Skeleton animation="wave" variant="rect" height={366} />
                </CardContent>
                <CardActions className={classes.footer}>
                    <Skeleton animation="wave" height={10} width="30%" />
                </CardActions>
            </Card>
        )
    if (!trending) return null

    const { coin, currency, platform, market, tickers } = trending

    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={coin.home_url}>
                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol} />
                    </Linking>
                }
                title={
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6">
                            {typeof coin.market_cap_rank === 'number' ? (
                                <span className={classes.rank} title="Market Cap Rank">
                                    #{coin.market_cap_rank}
                                </span>
                            ) : null}
                            <Linking href={coin.home_url}>{coin.symbol.toUpperCase()}</Linking>
                            <span>{` / ${currency.name}`}</span>
                        </Typography>
                    </Box>
                }
                subheader={
                    <>
                        <Typography component="p" variant="body1">
                            <span>{`${currency.symbol ?? `${currency.name} `}${formatCurrency(
                                market.current_price,
                            )}`}</span>
                            {typeof market.price_change_percentage_24h === 'number' ? (
                                <PriceChanged amount={market.price_change_percentage_24h} />
                            ) : null}
                        </Typography>
                    </>
                }
                disableTypography
            />
            <CardContent className={classes.content}>
                <Paper variant="outlined">
                    <Tabs
                        className={classes.tabs}
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        <Tab label="Price"></Tab>
                        <Tab label="Exchange"></Tab>
                    </Tabs>
                    {tabIndex === 0 ? (
                        <>
                            <PriceChangedTable market={market} />
                            <PriceChart stats={stats} loading={loadingStats}>
                                <PriceChartDaysControl days={days} onDaysChange={setDays}></PriceChartDaysControl>
                            </PriceChart>
                        </>
                    ) : (
                        <TickersTable tickers={tickers} />
                    )}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                    <span>Switch Data Source: </span>
                    {getEnumAsArray(Platform).map((x) => (
                        <Link
                            className={classes.platform}
                            key={x.key}
                            color={platform === x.value ? 'primary' : 'textSecondary'}>
                            {resolvePlatformName(x.value)}
                        </Link>
                    ))}
                </Typography>
            </CardActions>
        </Card>
    )
}
