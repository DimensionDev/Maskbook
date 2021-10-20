import { Typography, Box } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            width: '100%',
        },
        countdown: {
            color: '#eb5757',
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    dateEnding: number
}

export interface CountdownDate {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function FoundationCountdown(props: Props) {
    const [currentCount, setCount] = useState<CountdownDate>()
    const [ended, setEnded] = useState<boolean>(false)
    const { classes } = useStyles()
    const { t } = useI18N()
    const nftDateEnding = props.dateEnding
    useEffect(() => {
        if (nftDateEnding > Date.now()) {
            const timer = setInterval(() => {
                const now = Date.now()
                const distance = nftDateEnding - now
                setCount({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                })
                console.log(currentCount)
            }, 1000)
            return () => {
                clearTimeout(timer)
            }
        }
        setEnded(true)
        return
    }, [currentCount])

    return (
        <Box className={classes.body}>
            {ended ? (
                <Typography
                    style={{ width: '100%' }}
                    variant="h5"
                    align="center"
                    gutterBottom
                    className={classes.countdown}>
                    {t('plugin_foundation_auction_over')}
                </Typography>
            ) : (
                <Typography
                    style={{ width: '100%' }}
                    variant="h5"
                    align="center"
                    gutterBottom
                    className={classes.countdown}>
                    {t('plugin_foundation_ending_in', {
                        days: currentCount?.days,
                        hours: currentCount?.hours,
                        minutes: currentCount?.minutes,
                        seconds: currentCount?.seconds,
                    })}
                </Typography>
            )}
        </Box>
    )
}
export default FoundationCountdown
