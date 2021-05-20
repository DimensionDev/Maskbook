import { memo } from 'react'
import { makeStyles } from '@material-ui/core'
import { SendRedPacketAd, ITOAd, DebitAd, FollowTwitterAd } from '@dimensiondev/icons'
const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3.125),
        display: 'flex',
        flexDirection: 'column',
        '& > *': {
            marginBottom: theme.spacing(2),
        },
    },
    ad: {
        fill: 'none',
        width: 250,
        height: 140,
    },
}))

export const Advertisements = memo(() => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <SendRedPacketAd className={classes.ad} />
            <ITOAd className={classes.ad} />
            <DebitAd className={classes.ad} />
            <FollowTwitterAd className={classes.ad} style={{ height: 80 }} />
        </div>
    )
})
