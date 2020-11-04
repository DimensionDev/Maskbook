import React from 'react'
import Tilt from 'react-tilt'
import { Card, createStyles, makeStyles } from '@material-ui/core'
import type { ElectionToken } from '../types'
import { Image } from '../../../components/shared/Image'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
        content: {},
        identifier: {
            color: theme.palette.common.white,
            fontSize: 12,
            borderRadius: 4,
            display: 'block',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            left: 0,
            bottom: 0,
            position: 'absolute',
        },
    }),
)

export interface ElectionCardProps {
    token: ElectionToken
}

export function ElectionCard(props: ElectionCardProps) {
    const classes = useStyles(props)

    return (
        <Tilt options={{ scale: 1, max: 30, glare: true, 'max-glare': 1, speed: 1000 }}>
            <Card
                className={classes.root}
                style={{
                    width: 160,
                    height: 220,
                }}>
                <Image component="img" width={160} height={220} src={props.token.tokenImageURL} />
            </Card>
        </Tilt>
    )
}
