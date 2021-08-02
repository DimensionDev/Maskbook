import { Avatar, Grid, Link, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Market } from '../types'
// import { PluginDHedgeMessages } from '../messages'
// import type { Pool } from '../types'

const useStyles = makeStyles((theme) => ({
    meta: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    avatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
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

    const classes = useStyles()
    const { t } = useI18N()

    return (
        <Grid container direction="row" wrap="nowrap" className={classes.meta}>
            <Grid item container alignItems="center" xs={2}>
                <Link target="_blank" rel="noopener noreferrer" href={market.link}>
                    <Avatar src="" className={classes.avatar} />
                </Link>
            </Grid>
            <Grid item container direction="column" xs={10}>
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
            </Grid>
        </Grid>
    )
}
