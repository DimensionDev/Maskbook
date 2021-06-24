import { memo } from 'react'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3.125),
        display: 'flex',
        flexDirection: 'column',
        '& > *': {
            marginBottom: theme.spacing(2),
        },
    },
    img: {
        fill: 'none',
        width: 250,
        height: 140,
    },
}))

export const FeaturePromotions = memo(() => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <img className={classes.img} src={new URL('./SendRedPacket.png', import.meta.url).toString()} />
            <img className={classes.img} src={new URL('./ITO.png', import.meta.url).toString()} />
            <img className={classes.img} src={new URL('./BuyETH.png', import.meta.url).toString()} />
            <img
                className={classes.img}
                src={new URL('./FollowUs.png', import.meta.url).toString()}
                style={{ height: 80 }}
            />
        </div>
    )
})
