import { FormControl, Typography, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    text: {
        fontWeight: 500,
    },
    action: {},
    control: {
        textAlign: 'left',
        flex: 1,
        width: '100%',
        margin: theme.spacing(1, 0),
    },
    wrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    cursor: {
        cursor: 'pointer',
    },
}))

interface WalletLineProps {
    line1?: JSX.Element | string
    line2?: JSX.Element | string
    invert?: boolean
    onClick?(): void
    action?: JSX.Element | string
}

// TODO: abstract common line
export default function WalletLine(props: WalletLineProps) {
    const { classes } = useStyles()
    const { line1, line2, invert, action, onClick } = props

    return (
        <>
            <div className={classNames(classes.wrapper, { [classes.cursor]: !!onClick })} onClick={onClick}>
                <FormControl variant="standard" className={classes.control}>
                    <Typography className={classes.text} variant={invert ? 'body1' : 'overline'}>
                        {line1}
                    </Typography>
                    <Typography
                        variant={invert ? 'caption' : 'body1'}
                        component="a"
                        className={classNames(classes.text)}>
                        {line2}
                    </Typography>
                </FormControl>
                {action}
            </div>
            <Divider />
        </>
    )
}
