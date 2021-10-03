import { Typography, Grid } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import type { Auction } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        countdown: {
            color: '#eb5757',
            padding: theme.spacing(0.5, 2),
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    auctions: Auction[]
}

export interface CountdownDate {
    hours: number
    minutes: number
    seconds: number
}

function FoudationCountdown(props: Props) {
    const [currentCount, setCount] = useState<CountdownDate>()
    const { classes } = useStyles()
    const { t } = useI18N()
    const timer = () => {
        const now = Date.now()
        const distance = NftdateEnding - now
        setCount({
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
    }
    const NftdateEnding = new Date(Number(props.auctions.at(-1)?.dateEnding) * 1000).getTime()
    useEffect(() => {
        if (NftdateEnding > Date.now()) {
            setInterval(timer, 1000)
        }
    }, [])
    if (NftdateEnding > Date.now()) {
        return (
            <Grid item xs={12}>
                <Typography
                    style={{ width: '100%' }}
                    variant="h4"
                    align="center"
                    gutterBottom
                    className={classes.countdown}>
                    {`${t('plugin_foundation_ending_in')} ${currentCount?.hours} h ${currentCount?.minutes} m ${
                        currentCount?.seconds
                    } s`}
                </Typography>
            </Grid>
        )
    }
    return <></>
}
export default FoudationCountdown
