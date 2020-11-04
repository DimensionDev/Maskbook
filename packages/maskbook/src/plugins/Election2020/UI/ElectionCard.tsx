import React from 'react'
import Tilt from 'react-tilt'
import { Card, CardContent, createStyles, makeStyles, Typography } from '@material-ui/core'
import { CANDIDATE_TYPE, ElectionToken, US_PARTY_TYPE } from '../types'
import { Image } from '../../../components/shared/Image'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 4,
            position: 'relative',
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
    candidateType: CANDIDATE_TYPE
    candidatePartyType: US_PARTY_TYPE
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
                    backgroundImage:
                        props.candidatePartyType === US_PARTY_TYPE.BLUE
                            ? 'linear-gradient(180deg, #74B4FF 6%, #0947E5 84%)'
                            : 'linear-gradient(180deg, #D81A1A 6%, #E50909 84%)',
                }}>
                <Image component="img" width={160} height={220} src={props.token.tokenImageURL} />
                <CardContent className={classes.content}>
                    <Typography>{props.candidatePartyType === US_PARTY_TYPE.BLUE ? 'BIDEN' : 'TRUMP'}</Typography>
                </CardContent>
            </Card>
        </Tilt>
    )
}
