import {
    Box,
    Card,
    CardHeader,
    CardContent,
    CardMedia,
    CardActionArea,
    Typography,
    Button,
    Grid,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useState, useEffect } from 'react'
import { useMarketBySlug } from '../hooks/useMarket'
import { Card as RCCard, Market, MarketState } from '../types'
import { CardDialog } from './cardDialog'
import { formatBalance, formatPercentage, isSameAddress } from '@masknet/web3-shared-evm'
import { useBaseToken } from '../hooks/useBaseToken'
import BigNumber from 'bignumber.js'
import { FormattedAddress } from '@masknet/shared'

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
    winnerCard: {
        borderColor: theme.palette.success.main,
    },
    loserCard: {
        borderColor: theme.palette.error.main,
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
    flexBox: {
        dispaly: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
}))

const toLocale = (no: number) => {
    return no.toLocaleString()
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
    console.log(market)

    if (loading) return <Typography color="textPrimary">Loading...</Typography>
    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )

    if (!market) return null
    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <CardHeader
                title={market.name}
                titleTypographyProps={{ variant: 'h5', color: 'textPrimary' }}
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

    const [day, setDay] = useState(0)
    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const state =
        market.state === MarketState.Open
            ? { label: 'OPEN', color: 'success', potSize: 'POT SIZE' }
            : market.state === MarketState.Withdraw
            ? { label: 'ENDED', color: 'default', potSize: 'FINAL POT SIZE' }
            : { label: 'WAITING FOR RESOLUTION', color: 'warning', potSize: 'FINAL POT SIZE' }

    useEffect(() => {
        const date1 = Date.now()
        const date2 = Number.parseInt(market.lockingTime, 10) * 1000
        const diff = date2 - date1
        setDay(new Date(diff).getUTCDate() - 1)
        setHour(new Date(diff).getUTCHours())
        setMinute(new Date(diff).getUTCMinutes())
    }, [market.lockingTime])

    return (
        <Grid container justifyContent="space-between">
            <Grid item sx={{ my: 2 }}>
                <Chip label={state.label} color={state.color} />
            </Grid>
            <Grid item container justifyContent="space-between" alignItems="center" sx={{ width: 'auto' }}>
                <Tooltip
                    title="hello"
                    arrow
                    placement="top"
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Grid item container direction="column" sx={{ width: 'auto', mx: 1 }}>
                        <Grid item>{state.potSize}</Grid>
                        <Grid item>
                            <Typography variant="body1" color="text.primary" component="span">
                                {toLocale(2554)}
                            </Typography>{' '}
                            USDC
                        </Grid>
                    </Grid>
                </Tooltip>
                <Grid item container direction="column" sx={{ width: 'auto', mx: 1 }}>
                    <Grid item>
                        <Tooltip
                            title="The average sum of rental prices of all outcomes, calculated as the pot divided by the number of hours since the event begun. This is helpful to understand whether Cards are over or underpriced."
                            arrow
                            placement="top"
                            PopperProps={{
                                disablePortal: true,
                            }}>
                            <span>AVERAGE RENTALS</span>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="text.primary" component="span">
                            {toLocale(2554)}
                        </Typography>{' '}
                        USDC
                    </Grid>
                </Grid>
                {market.state === MarketState.Open ? (
                    <Grid item container direction="column" sx={{ width: 'auto', mx: 1 }}>
                        <Grid item>CLOSES IN</Grid>
                        <Grid item>
                            <Tooltip
                                title="hello"
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
        </Grid>
    )
}

interface CardViewProps {
    card: RCCard
    market: Market
}

function CardView(props: CardViewProps) {
    const { card, market } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const [cardDialogOpen, setCardDialogOpen] = useState(false)
    const isWinner = isSameAddress(card.id, market.winningOutcome?.id ?? '')
    const token = useBaseToken()
    const priceHourly = new BigNumber(card.price).div(24).toFixed(2)
    const share = new BigNumber(card.price).div(market.sumOfAllPrices).toFixed(2)
    const ownerAddress = market.state === MarketState.Open ? card.originalNft.owner.id : card.longestOwner.id

    return (
        <Card
            className={`${classes.cards} ${
                isWinner ? classes.winnerCard : market.state === MarketState.Withdraw ? classes.loserCard : ''
            }`}>
            <CardActionArea
                sx={{ display: 'flex', alignItems: 'stretch' }}
                onClick={() => (market.state === MarketState.Open ? setCardDialogOpen(true) : null)}>
                <CardMedia component="img" className={classes.cardMedia} image={card.image} alt={card.outcomeName} />
                <CardContent className={classes.cardContent}>
                    <Box>
                        <Typography variant="h6">{card.outcomeName}</Typography>
                        <Typography variant="body1" component="strong" sx={{ fontSize: '1.2rem' }} gutterBottom>
                            {formatBalance(priceHourly, token.decimals)}
                        </Typography>
                        <Typography variant="caption" component="span" gutterBottom>
                            {' '}
                            /{t('plugin_realitycards_hour')}
                        </Typography>
                    </Box>

                    <Grid container flexWrap="nowrap">
                        <Grid item container direction="column" flex={3}>
                            <Grid item>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                    {market.state === MarketState.Open
                                        ? t('plugin_realitycards_currently_owned_by')
                                        : t('plugin_realitycards_owned_by')}
                                </Typography>
                            </Grid>
                            <Grid item container direction="column">
                                <Grid item>
                                    <Typography variant="body1">
                                        <FormattedAddress address={ownerAddress} size={4} />
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        {market.state !== MarketState.Withdraw ? (
                            <Grid item container direction="column" flex={2} alignItems="flex-end">
                                <Grid item container alignItems="center" justifyContent="flex-end" flexWrap="nowrap">
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                        {t('plugin_realitycards_winning_odds')}
                                    </Typography>
                                    <Tooltip
                                        title="The odds of this outcome occurring, based on current market sentiment. Calculated as the rental price of this Card, divided by the sum of rental prices of all Cards, expressed as a percentage"
                                        arrow
                                        placement="top"
                                        PopperProps={{
                                            disablePortal: true,
                                        }}>
                                        <IconButton size="small" sx={{ p: 0, ml: 0.5 }}>
                                            <HelpRoundedIcon sx={{ fontSize: '1rem' }} color="info" />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" component="strong" sx={{ fontSize: '1.2rem' }}>
                                        {formatPercentage(share)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        ) : null}
                    </Grid>
                </CardContent>
            </CardActionArea>
            <CardDialog open={cardDialogOpen} market={market} card={card} onClose={() => setCardDialogOpen(false)} />
        </Card>
    )
}
