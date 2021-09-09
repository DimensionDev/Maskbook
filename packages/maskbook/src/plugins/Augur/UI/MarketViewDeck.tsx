import { Grid, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Market } from '../types'
import { WinnerIcon } from './WinnerIcon'

const useStyles = makeStyles()((theme) => ({
    meta: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },

    title: {
        padding: theme.spacing(1, 0),
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
}))

interface MarketDeckProps {
    market: Market
}

export const MarketViewDeck = (props: MarketDeckProps) => {
    const { market } = props

    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <Grid container direction="row" wrap="nowrap" className={classes.meta}>
            <Grid item container direction="column">
                <Grid item className={classes.title}>
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href={market.link}>
                        <Typography variant="h6">{market.title}</Typography>
                        <Typography variant="h6">{market.description}</Typography>
                    </Link>
                </Grid>
                <Grid item className={classes.meta}>
                    <Typography variant="body2" color="textSecondary" className={classes.text}>
                        {market.endDate.toString()}
                    </Typography>
                </Grid>
                {market.hasWinner ? (
                    <Grid item className={classes.meta}>
                        <Typography variant="h6" color="textSecondary" className={classes.text}>
                            {t('plugin_augur_winner')}: {market.outcomes.find((x) => x.isWinner)?.name}
                            <WinnerIcon />
                        </Typography>
                    </Grid>
                ) : null}
            </Grid>
        </Grid>
    )
}
