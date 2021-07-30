import { Avatar, Grid, Link, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
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

// interface PoolDeckProps {
//     pool: Pool
//     inputToken: FungibleTokenDetailed
// }

export const MarketViewDeck = () => {
    // const { pool, inputToken } = props

    const classes = useStyles()
    const { t } = useI18N()

    return (
        <Grid container direction="row" wrap="nowrap" className={classes.meta}>
            <Grid item container alignItems="center" xs={2}>
                <Link target="_blank" rel="noopener noreferrer" href="">
                    <Avatar src="" className={classes.avatar} />
                </Link>
            </Grid>
            <Grid item container direction="column" xs={10}>
                <Grid item className={classes.title}>
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href="">
                        <Typography variant="h6">Which team will win?</Typography>
                        <Typography variant="h6">Philadelphia Phillies vs Pittsburgh Pirates</Typography>
                    </Link>
                </Grid>
                <Grid item className={classes.meta}>
                    <Typography variant="body2" color="textSecondary" className={classes.text}>
                        JUL 31, 2021 3:35 AM (GMT+4:30)
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    )
}
