import { Box, Card, CardContent, CardMedia, CardActionArea, Typography, Grid, Tooltip } from '@mui/material'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useState } from 'react'
import { Card as RCCard, Market, MarketState } from '../types'
import { CardDialog } from './CardDialog'
import { formatBalance, formatPercentage, isSameAddress } from '@masknet/web3-shared-evm'
import { useBaseToken } from '../hooks/useBaseToken'
import BigNumber from 'bignumber.js'
import { FormattedAddress } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
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
}))

export interface CardViewProps {
    card: RCCard
    market: Market
}

export function CardView(props: CardViewProps) {
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
                                        title={t('plugin_realitycards_winning_odds_message')}
                                        arrow
                                        placement="top"
                                        PopperProps={{
                                            disablePortal: true,
                                        }}>
                                        <HelpRoundedIcon sx={{ p: 0, ml: 0.5, fontSize: '1rem' }} color="info" />
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
