import { Alert, type AlertProps } from '@mui/material'
import { alpha } from '../../Theme/colors.js'
import { makeStyles } from '../../UIHelper/makeStyles.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(2),
        padding: 11,
        borderRadius: 4,
    },
    message: {
        fontSize: 14,
        fontWeight: 400,
        padding: 0,
    },
    icon: {
        width: 22,
        height: 22,
        padding: 0,
    },
    action: {
        padding: 0,
    },
    warning: {
        color: theme.vars.palette.maskColor.warn,
        background: alpha(theme.vars.palette.maskColor.warn, 0.1),
    },
    error: {
        color: theme.vars.palette.maskColor.danger,
        background: alpha(theme.vars.palette.maskColor.danger, 0.1),
    },
}))

export function MaskAlert(props: AlertProps) {
    const { children, ...rest } = props
    const { classes } = useStyles()

    return (
        <Alert
            {...rest}
            classes={{
                root: classes.root,
                message: classes.message,
                icon: classes.icon,
                action: classes.action,
                colorWarning: classes.warning,
                colorError: classes.error,
                ...rest.classes,
            }}>
            {children}
        </Alert>
    )
}
