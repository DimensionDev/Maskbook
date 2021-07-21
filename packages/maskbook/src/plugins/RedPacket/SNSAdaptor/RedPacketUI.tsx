import { getAssetAsBlobURL } from '../../../utils'
import { Card, CardContent, CardHeader, CardMedia, Link, Typography } from '@material-ui/core'
import LaunchIcon from '@material-ui/icons/Launch'
import { useCallback, useState } from 'react'
import { RedPacketNftShareDialog } from './RedPacketNftShare'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1),
        background: '#DB0632',
        position: 'relative',
        color: theme.palette.common.white,
        boxSizing: 'border-box',
        backgroundImage: `url(${new URL('./assets/background.png', import.meta.url)})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    title: {
        textAlign: 'left',
    },
    image: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 160,
        backgroundSize: 'contain',
        textAlign: 'center',
        justifyContent: 'center',
    },
    remain: {
        marginLeft: 28,
        paddingTop: 40,
        color: '#FAD85A',
        width: '100%',
    },
    claim: {
        textAlign: 'center',
        marginTop: theme.spacing(1),
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between !important',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },

    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
        '&>:first-child': {
            marginRight: theme.spacing(1),
        },
    },
}))

export interface RedPacketNftUIProps {
    claim?: boolean
}

export function RedPacketNftUI(props: RedPacketNftUIProps) {
    const { classes } = useStyles()
    const { claim } = props
    const [open, setOpen] = useState(false)

    const onClose = useCallback(() => {
        setOpen(false)
    }, [])

    const onClick = useCallback(() => {
        setOpen(true)
    }, [])
    return (
        <>
            <Card className={classes.card} component="article" elevation={0}>
                <CardHeader
                    className={classes.title}
                    title="100th anniversary of the Mona Lisa"
                    subheader={
                        <div className={classes.link}>
                            <Typography variant="body2" color="textPrimary">
                                100th LISA
                            </Typography>
                            <Link color="textPrimary" target="_blank" rel="noopener noreferrer" onClick={onClick}>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        </div>
                    }
                />

                <CardMedia
                    className={classes.image}
                    component="div"
                    image={
                        !claim
                            ? new URL('./assets/redpacket.nft.png', import.meta.url).toString()
                            : getAssetAsBlobURL(new URL('./assets/nft.gift.jpg', import.meta.url))
                    }
                    title="nft icon">
                    {!claim ? <Typography className={classes.remain}>5 Collectibles</Typography> : null}
                </CardMedia>
                {claim ? (
                    <Typography variant="body1" className={classes.claim}>
                        You got 1 Mona Lisa
                    </Typography>
                ) : null}
                <CardContent>
                    <Typography variant="body1" color="textSecondary">
                        This image contains a Red Packet Use Maskbook to open it.
                    </Typography>
                </CardContent>
                <div className={classes.footer}>
                    <Link href="https://mask.io/" target="_blank" rel="noopener noreferrer" color="textPrimary">
                        Mask.io
                    </Link>
                    <Typography variant="body1">From: @Pineapple</Typography>
                </div>
            </Card>
            <RedPacketNftShareDialog open={open} onClose={onClose} />
        </>
    )
}
