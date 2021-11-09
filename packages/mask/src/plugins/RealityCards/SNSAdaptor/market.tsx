import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Button,
    Grid,
    Tooltip,
    CircularProgress,
    Link,
    Chip,
} from '@mui/material'
import { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useState } from 'react'
import { useMarketBySlug } from '../hooks/useMarket'
import { Card as RCCard, Market, MarketState } from '../types'
import { formatBalance, resolveAddressLinkOnExplorer, useChainId } from '@masknet/web3-shared-evm'
import { useBaseToken } from '../hooks/useBaseToken'
import BigNumber from 'bignumber.js'
import { GiveawayPopup } from './giveaway'
import { CardView } from './card'
import { MarketDescriptionIcon, MarketDescriptionPopup } from './marketDescription'
import { ExplorerIcon, GiveawayIcon } from './icons'
import { useInterval } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
    cards: {
        margin: '10px 0',
        border: `solid 2px ${theme.palette.divider}`,
    },
    cardMedia: {
        width: 150,
    },
    cardContent: {
        width: '100%',
        padding: 8,
        '&:last-child': {
            paddingBottom: 8,
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    background: {
        backgroundColor: theme.palette.action.disabled,
    },
}))

const toFixed = (amount: string) => {
    return new BigNumber(amount, 10).toFixed(0, BigNumber.ROUND_HALF_CEIL)
}

const toLocale = (amount: string) => {
    return Number.parseFloat(amount).toLocaleString()
}

interface MarketProps {
    link: string
    slug: string
}

interface MarketDetailsProps {
    market: Market
}

export function MarketView(props: MarketProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const { value: market, error, loading, retry } = useMarketBySlug(props.slug)

    if (loading)
        return (
            <Typography color="textPrimary" textAlign="center">
                {t('loading')}
                <CircularProgress sx={{ mx: 1 }} color="primary" size={13} />
            </Typography>
        )

    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">{t('plugin_realitycards_error_something_went_wrong')}</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    {t('retry')}
                </Button>
            </Box>
        )

    if (!market) return null
    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <CardHeader
                title={
                    <Link target="_blank" href={props.link}>
                        {market.name}
                    </Link>
                }
                titleTypographyProps={{ variant: 'h5', color: 'textPrimary' }}
                href={props.link}
                subheader={<MarketDetails market={market} />}
                subheaderTypographyProps={{ variant: 'body2' }}
            />

            <CardContent className={classes.content}>
                <Grid container direction="column">
                    {market.cards.map((card: RCCard) => (
                        <Grid item key={card.id}>
                            <CardView card={card} market={market} />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    )
}

function MarketDetails(props: MarketDetailsProps) {
    const { market } = props
    const { t } = useI18N()

    const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false)
    const [giveawayDialogOpen, setGiveawayDialogOpen] = useState(false)
    const chainId = useChainId()
    const token = useBaseToken()

    const [day, setDay] = useState(0)
    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const state: {
        label: string
        color: 'default' | 'error' | 'success' | 'warning' | 'primary' | 'secondary' | 'info' | undefined
        potSize: string
    } = useMemo(() => {
        return market.state === MarketState.Open
            ? {
                  label: t('plugin_realitycards_event_state_open'),
                  color: 'success',
                  potSize: t('plugin_realitycards_event_pot_size'),
              }
            : market.state === MarketState.Withdraw
            ? {
                  label: t('plugin_realitycards_event_state_ended'),
                  color: 'default',
                  potSize: t('plugin_realitycards_event_final_pot_size'),
              }
            : {
                  label: t('plugin_realitycards_event_state_locked'),
                  color: 'warning',
                  potSize: t('plugin_realitycards_event_final_pot_size'),
              }
    }, [market.state])

    const avgRental = useMemo(() => {
        const utcTimestamp = new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000).getTime() / 1000
        const elapsedTime = utcTimestamp - Number.parseInt(market.openingTime, 10)
        return formatBalance(
            new BigNumber(market.totalCollected)
                .minus(market.sponsorAmount)
                .div(elapsedTime)
                .multipliedBy(60 * 60),
            token.decimals,
            1,
        )
    }, [market.openingTime, market.totalCollected, market.sponsorAmount, token.decimals])

    const amountFromRent = useMemo(() => {
        return new BigNumber(market.totalCollected).minus(market.sponsorAmount)
    }, [market.totalCollected, market.sponsorAmount])

    useInterval(() => {
        const date1 = Date.now()
        const date2 = Number.parseInt(market.lockingTime, 10) * 1000
        const diff = date2 - date1
        setDay(new Date(diff).getUTCDate() - 1)
        setHour(new Date(diff).getUTCHours())
        setMinute(new Date(diff).getUTCMinutes())
    }, 10)

    return (
        <Grid container direction="column">
            <Grid item container alignItems="center">
                <Chip sx={{ my: 1, mr: 1, textTransform: 'uppercase' }} label={state.label} color={state.color} />
                <Tooltip
                    title={market.id}
                    arrow
                    placement="top"
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Link
                        sx={{ mx: 1, display: 'flex', alignItems: 'center' }}
                        href={resolveAddressLinkOnExplorer(chainId, market.id)}
                        rel="noopener noreferrer"
                        target="_blank">
                        <ExplorerIcon />
                    </Link>
                </Tooltip>
                <Tooltip
                    title={t('plugin_realitycards_event_description_tooltip')}
                    arrow
                    placement="top"
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Link
                        sx={{ cursor: 'pointer', mx: 1, display: 'flex', alignItems: 'center' }}
                        onClick={() => {
                            setDescriptionDialogOpen(true)
                        }}>
                        <MarketDescriptionIcon />
                    </Link>
                </Tooltip>
                {!!market.giveawayText ? (
                    <Tooltip
                        title="Token Giveaway"
                        arrow
                        placement="top"
                        PopperProps={{
                            disablePortal: true,
                        }}>
                        <Link
                            sx={{ cursor: 'pointer', mx: 1, display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                                setGiveawayDialogOpen(true)
                            }}
                            rel="noopener noreferrer"
                            target="_blank">
                            <GiveawayIcon />
                        </Link>
                    </Tooltip>
                ) : null}
            </Grid>

            <Grid item container justifyContent="space-between" alignItems="center">
                <Tooltip
                    title={
                        <Grid container direction="column">
                            <span>{t('plugin_realitycards_event_initial_pot_size')}:</span>
                            <Typography variant="caption">
                                {toLocale(formatBalance(market.sponsorAmount, token.decimals, 0))} {token.symbol}
                            </Typography>
                            <span>{t('plugin_realitycards_event_amount_from_rent')}:</span>
                            <Typography variant="caption">
                                {toLocale(formatBalance(amountFromRent, token.decimals, 0))} {token.symbol}
                            </Typography>
                        </Grid>
                    }
                    arrow
                    placement="top"
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Grid item container direction="column" sx={{ width: 'auto' }}>
                        <Grid item>
                            <Typography sx={{ textTransform: 'uppercase' }}>{state.potSize}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" color="text.primary" component="span">
                                {toLocale(toFixed(formatBalance(market.totalCollected, token.decimals, 0)))}{' '}
                                {token.symbol}
                            </Typography>
                        </Grid>
                    </Grid>
                </Tooltip>
                <Grid item container direction="column" sx={{ width: 'auto' }}>
                    <Grid item>
                        <Tooltip
                            title={t('plugin_realitycards_event_average_rentals_tooltip')}
                            arrow
                            placement="top"
                            PopperProps={{
                                disablePortal: true,
                            }}>
                            <Typography sx={{ textTransform: 'uppercase' }}>
                                {t('plugin_realitycards_event_average_rentals')}
                            </Typography>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="text.primary" component="span">
                            {toLocale(avgRental)} {token.symbol}
                        </Typography>
                    </Grid>
                </Grid>
                {market.state === MarketState.Open ? (
                    <Grid item container direction="column" sx={{ width: 'auto' }}>
                        <Grid item>
                            <Typography sx={{ textTransform: 'uppercase' }}>
                                {t('plugin_realitycards_event_closes_in')}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip
                                title={new Date(Number.parseInt(market.lockingTime, 10) * 1000).toString()}
                                arrow
                                placement="top"
                                PopperProps={{
                                    disablePortal: true,
                                }}>
                                <Grid container>
                                    <Grid item container sx={{ width: 'auto', mr: 0.5 }} alignItems="flex-end">
                                        <Box>
                                            <Typography variant="body1" color="text.primary" component="span">
                                                {day}
                                            </Typography>
                                        </Box>
                                        <Box>d</Box>
                                    </Grid>
                                    <Grid item container sx={{ width: 'auto', mr: 0.5 }} alignItems="flex-end">
                                        <Box>
                                            <Typography variant="body1" color="text.primary" component="span">
                                                {hour}
                                            </Typography>
                                        </Box>
                                        <Box>h</Box>
                                    </Grid>
                                    <Grid item container sx={{ width: 'auto' }} alignItems="flex-end">
                                        <Box>
                                            <Typography variant="body1" color="text.primary" component="span">
                                                {minute}
                                            </Typography>
                                        </Box>
                                        <Box>m</Box>
                                    </Grid>
                                </Grid>
                            </Tooltip>
                        </Grid>
                    </Grid>
                ) : (
                    ''
                )}
            </Grid>
            <MarketDescriptionPopup
                open={descriptionDialogOpen}
                market={market}
                onClose={() => setDescriptionDialogOpen(false)}
            />
            <GiveawayPopup open={giveawayDialogOpen} market={market} onClose={() => setGiveawayDialogOpen(false)} />
        </Grid>
    )
}
