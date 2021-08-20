import { useState } from 'react'
import { Box, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { useInterval } from 'react-use'
import { ONE_SECOND } from '../constants'
import { DarkColor } from '@masknet/theme/constants'
import intervalToDuration from 'date-fns/intervalToDuration'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        maxWidth: '300px',
    },
    part: {
        alignItems: 'center',
        width: '24%',
    },
    end: {
        textAlign: 'center',
    },
    digit: {
        backgroundColor: '#492e73',
        borderRadius: theme.spacing(0.5),
        color: '#6cf5db',
        width: '50%',
    },
    placeholder: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
    },
    lable: {
        color: '#a69bbc',
    },
    seperator: {
        color: '#6cf5db',
        width: '2%',
    },
}))

interface CountdownProps extends withClasses<'digit' | 'seperator'> {
    secondsRemaining: number
    msgOnEnd: string
}

export const CountdownView = (props: CountdownProps) => {
    const classes = useStylesExtends(useStyles(), props)

    const { secondsRemaining, msgOnEnd } = props
    const [secs, setSecs] = useState(secondsRemaining)

    useInterval(() => {
        setSecs(secs - 1)
    }, ONE_SECOND)

    const { days, hours, minutes, seconds } = intervalToDuration({ start: 0, end: secs * 1000 })

    if (secs <= 0 || (days === 0 && hours === 0 && minutes === 0 && seconds === 0)) {
        return (
            <Typography variant="h6" color={DarkColor.textSecondary} className={classes.end}>
                {msgOnEnd}
            </Typography>
        )
    }

    const daysArray = days?.toString().split('') ?? [0, 0]
    const hoursArray = hours?.toString().split('') ?? [0, 0]
    const minutesArray = minutes?.toString().split('') ?? [0, 0]
    const secondsArray = seconds?.toString().split('') ?? [0, 0]

    // 86400 seconds = 1 day
    // 3600 seconds = 1 hour
    const textColor = secondsRemaining >= 86400 ? 'green-1' : secondsRemaining >= 3600 ? 'yellow-1' : 'red-1'

    interface DigitProps {
        digit: number | string
    }

    const Digit = (props: DigitProps) => {
        return (
            <Typography variant="body1" fontWeight="fontWeightBold">
                {props.digit}
            </Typography>
        )
    }
    const LeftDigit = (props: DigitProps) => {
        return (
            <Box py={0.2} mr={0.1} ml={0.3} className={classes.digit}>
                <Digit digit={props.digit} />
            </Box>
        )
    }

    const RightDigit = (props: DigitProps) => {
        return (
            <Box py={0.2} mr={0.3} ml={0.1} className={classes.digit}>
                <Digit digit={props.digit} />
            </Box>
        )
    }

    interface DoubleDigitsProps {
        leftDigit: number | string
        rightDigit: number | string
        lable: string
    }

    const DoubleDigits = (props: DoubleDigitsProps) => {
        const { leftDigit, rightDigit, lable } = props

        return (
            <>
                <Box className={classes.placeholder}>
                    <LeftDigit digit={leftDigit} />
                    <RightDigit digit={rightDigit} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" fontSize={8} className={classes.lable}>
                        {lable}
                    </Typography>
                </Box>
            </>
        )
    }

    const Seperator = () => {
        return (
            <Grid container item direction="column" className={classes.seperator}>
                <Box py={0.2}>
                    <Typography variant="body2" fontWeight="fontWeightBold">
                        :
                    </Typography>
                </Box>
            </Grid>
        )
    }

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid container item direction="column" className={classes.part}>
                <DoubleDigits
                    leftDigit={daysArray.length < 2 ? 0 : daysArray[0]}
                    rightDigit={daysArray.length > 1 ? daysArray[1] : daysArray[0]}
                    lable="DAY"
                />
            </Grid>
            <Grid container item direction="column" className={classes.part}>
                <DoubleDigits
                    leftDigit={hoursArray.length < 2 ? 0 : hoursArray[0]}
                    rightDigit={hoursArray.length > 1 ? hoursArray[1] : hoursArray[0]}
                    lable="HR"
                />
            </Grid>
            <Seperator />
            <Grid container item direction="column" className={classes.part}>
                <DoubleDigits
                    leftDigit={minutesArray.length < 2 ? 0 : minutesArray[0]}
                    rightDigit={minutesArray.length > 1 ? minutesArray[1] : minutesArray[0]}
                    lable="MIN"
                />
            </Grid>
            <Seperator />
            <Grid container item direction="column" className={classes.part}>
                <DoubleDigits
                    leftDigit={secondsArray.length < 2 ? 0 : secondsArray[0]}
                    rightDigit={secondsArray.length > 1 ? secondsArray[1] : secondsArray[0]}
                    lable="SEC"
                />
            </Grid>
        </Grid>
    )
}
