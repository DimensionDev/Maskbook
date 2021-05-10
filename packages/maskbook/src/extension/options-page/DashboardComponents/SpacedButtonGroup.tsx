import { Box, makeStyles, BoxProps } from '@material-ui/core'
import classNames from 'classnames'

const useStyles = makeStyles((theme) => ({
    buttonGroup: {
        flexGrow: 0,
        flexShrink: 0,
        '& > *:not(:last-child)': {
            marginRight: theme.spacing(2),
        },
    },
}))

export default function SpacedButtonGroup(_props: BoxProps) {
    const classes = useStyles()
    const { className, ...props } = _props
    return <Box className={classNames(className, classes.buttonGroup)} {...props} />
}
