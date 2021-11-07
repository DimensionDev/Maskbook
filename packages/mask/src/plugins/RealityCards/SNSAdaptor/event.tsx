import { Box, Card, CardHeader, CardContent, CardMedia, Typography, Button, Grid } from '@mui/material'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useState } from 'react'
import { useEventBySlug } from '../hooks/useEvent'
import type { Event } from '../types'
import { CardDialog } from './card'

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
        margin: '5px 0',
        border: `solid 2px ${theme.palette.divider}`,
        display: 'flex',
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
}))

const toLocale = (no: number) => {
    return no.toLocaleString()
}

interface EventProps {
    link: string
    slug: string
}

interface EventDetailsProps {
    event: Event
}

interface EventContentProps {
    event: object
}

export function EventView(props: EventProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [rentDialogOpen, setRentDialogOpen] = useState(false)

    const { value: event, error, loading, retry } = useEventBySlug(props.slug)
    // console.log(event, error, loading)
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
    if (!event) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <CardHeader
                title={event.name}
                titleTypographyProps={{ variant: 'h5', color: 'textPrimary' }}
                subheader={<EventDetails event={event} />}
                subheaderTypographyProps={{ variant: 'body2' }}
            />
            <Button variant="contained" fullWidth color="primary" onClick={() => setRentDialogOpen(true)}>
                rent
            </Button>
            <CardDialog
                open={rentDialogOpen}
                market={event}
                card={event.cards[0]}
                onClose={() => setRentDialogOpen(false)}
            />
            <CardContent className={classes.content}>
                <EventContent event={event} />
            </CardContent>
        </Card>
    )
}

function EventDetails(props: EventDetailsProps) {
    const { event } = props

    return (
        <Grid container wrap="nowrap" justifyContent="space-between" alignItems="center">
            <Grid item container justifyContent="space-between" alignItems="center" flex="1" wrap="nowrap">
                <Grid item container direction="column">
                    <Grid item>pot size</Grid>
                    <Grid item>
                        <Typography variant="body1" color="text.primary" component="span">
                            {toLocale(2554)}
                        </Typography>{' '}
                        USDC
                    </Grid>
                </Grid>
                <Grid item container direction="column">
                    <Grid item>average rentals</Grid>
                    <Grid item>12545</Grid>
                </Grid>
                <Grid item container direction="column">
                    <Grid item>closes in</Grid>
                    <Grid item>12545</Grid>
                </Grid>
            </Grid>
            <Grid item sx={{ textAlign: 'right' }}>
                open/ended
            </Grid>
        </Grid>
    )
}

function EventContent(props: EventContentProps) {
    const { event } = props
    const cards = event.cards
    const { classes } = useStyles()
    const isEnd = Boolean(event.winningOutcome)
    const winner = isEnd ? event.winningOutcome.id : null
    console.log(event)

    return (
        <Grid container direction="column">
            {cards.map((card) => (
                <Grid item key={card.id}>
                    <Card
                        className={`${classes.cards} ${
                            card.id === winner ? classes.winnerCard : winner ? classes.loserCard : ''
                        }`}>
                        <CardMedia
                            component="img"
                            className={classes.cardMedia}
                            image={card.image}
                            alt={card.outcomeName}
                        />
                        <CardContent className={classes.cardContent}>
                            <Box>
                                <Typography variant="h6">{card.outcomeName}</Typography>
                                <Typography variant="body1" component="strong" sx={{ fontSize: '1.2rem' }} gutterBottom>
                                    1.21 USDC
                                </Typography>
                                <Typography variant="caption" component="span" gutterBottom>
                                    {' '}
                                    /hour
                                </Typography>
                            </Box>

                            <Grid container flexWrap="nowrap">
                                <Grid item container direction="column" flex={3}>
                                    <Grid item>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                            currently owned by
                                        </Typography>
                                    </Grid>
                                    <Grid item container direction="column">
                                        <Grid item>
                                            <Typography>Address Hashtag</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" color="text.secondary" component="span">
                                                for
                                            </Typography>
                                            <Typography variant="body2" component="span">
                                                {' '}
                                                11 hours{' '}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" component="span">
                                                of
                                            </Typography>
                                            <Typography variant="body2" component="span">
                                                {' '}
                                                5 days{' '}
                                            </Typography>
                                            <Typography variant="body2" component="span">
                                                0.1%
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item container direction="column" flex={2} alignItems="flex-end">
                                    <Grid
                                        item
                                        container
                                        alignItems="center"
                                        justifyContent="flex-end"
                                        flexWrap="nowrap">
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                            winning odds
                                        </Typography>
                                        <HelpRoundedIcon sx={{ fontSize: '1rem', marginLeft: 1 }} color="disabled" />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" component="strong" sx={{ fontSize: '1.2rem' }}>
                                            92%
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}
