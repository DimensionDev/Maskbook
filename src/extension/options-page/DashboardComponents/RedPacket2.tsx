import React from 'react'
import { makeStyles, createStyles, Card, CardHeader, CardContent, Typography, Box } from '@material-ui/core'

import classNames from 'classnames'

const useStyles = makeStyles(theme =>
    createStyles({
        box: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
        },
        card: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        header: {
            padding: theme.spacing(2),
            background: 'rgb(253,234,214)',
            color: '#ED4E36',
        },
        content: {
            padding: theme.spacing(2),
            background: 'rgb(248,161,82)',
            color: '#FFFFFF',
        },
        action: {
            background: 'rgb(248,161,82)',
            color: '#FFFFFF',
            padding: theme.spacing(0, 2, 2),
        },
        packet: {
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='38' height='44' viewBox='0 0 38 44' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='38' height='44'%3E%3Crect width='38' height='44' rx='4' fill='%23D43E27'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Crect width='38' height='44' rx='4' fill='%23D43E27'/%3E%3Cellipse cx='20' cy='-5' rx='32' ry='25' fill='%23ED4E36'/%3E%3Ccircle cx='19' cy='19' r='7' fill='%23F6D39C'/%3E%3C/g%3E%3C/svg%3E%0A")`,
            width: '3.8em',
            height: '4.4em',
            flex: '0 0 auto',
            backgroundAttachment: 'local',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
        },
        text: {
            padding: theme.spacing(0.5, 2),
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
        },
    }),
)

export function RedPacket(props: { onClick?(): void }) {
    const classes = useStyles()
    const { onClick } = props
    return (
        <Card elevation={0} className={classes.box} component="article" onClick={onClick}>
            <div className={classNames(classes.card, classes.header)}>
                <Typography variant="body1">From: CMK</Typography>
                <Typography variant="body1">Sent 35.01 USDT</Typography>
            </div>
            <div className={classNames(classes.card, classes.content)}>
                <div style={{ display: 'flex' }}>
                    <div className={classes.packet}></div>
                    <div className={classes.text}>
                        <Typography variant="h6">"Best Wishes!"</Typography>
                        <Typography variant="body1">35.01 USDT / 7 shares</Typography>
                    </div>
                </div>
            </div>
            <div className={classNames(classes.card, classes.action)}>
                <Typography variant="body1">2 hr ago created</Typography>
                <Typography variant="body1">5/7 collected</Typography>
            </div>
        </Card>
    )
}
