import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        background: theme.palette.maskColor.bottom,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    offerDetail: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    flex: {
        display: 'flex',
        gap: 6,
    },
    textBase: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        '& > strong': {
            color: theme.palette.text.primary,
        },
    },
}))

interface NFTOfferCardProps {
    offer: any
}

export function NFTOfferCard(props: NFTOfferCardProps) {
    const { offer } = props
    const { classes } = useStyles()
    // if (!offer.value || offer.loading) return <Skeleton width="100%" height={60} />

    return (
        <div className={classes.wrapper}>
            <OpenSeaIcon width={24} height={24} />
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    <img width={20} height={20} src={offer.img ?? ''} alt="" />
                    <Typography className={classes.textBase}>
                        <strong style={{ fontSize: 14 }}>9,999,99.00</strong> <strong>$232.00</strong> 2% below{' '}
                    </Typography>
                </div>
                <div className={classes.flex} style={{ marginLeft: 40 }}>
                    <Typography className={classes.textBase}>
                        From <strong style={{ fontSize: 14 }}>B7000A2</strong> 11 hours ago Expires in 3 days
                    </Typography>
                </div>
            </div>
        </div>
    )
}
