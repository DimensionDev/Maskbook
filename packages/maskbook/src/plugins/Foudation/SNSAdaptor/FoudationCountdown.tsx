import { Typography, Box } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            width: '100%',
            margin: theme.spacing(1.5),
        },
        countdown: {
            color: '#eb5757',
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    dateEnding: string
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
    const NftdateEnding = new Date(Number(props.dateEnding) * 1000).getTime()
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now()
            const distance = NftdateEnding - now
            setCount({
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            })
        }, 1000)
        return () => {
            clearTimeout(timer)
        }
    }, [currentCount])
    return (
        <Box className={classes.body}>
            {NftdateEnding > Date.now() && (
                <Typography
                    style={{ width: '100%' }}
                    variant="h5"
                    align="center"
                    gutterBottom
                    className={classes.countdown}>
                    {`${t('plugin_foundation_ending_in')} ${currentCount?.hours} h ${currentCount?.minutes} m ${
                        currentCount?.seconds
                    } s`}
                </Typography>
            )}
        </Box>
    )
}
export default FoudationCountdown
