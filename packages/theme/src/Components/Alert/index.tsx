import { Alert, type AlertProps, alpha } from '@mui/material'
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
    standardWarning: {
        color: theme.palette.maskColor.warn,
        background: alpha(theme.palette.maskColor.warn, 0.1),
    },
    standardError: {
        color: theme.palette.maskColor.danger,
        background: alpha(theme.palette.maskColor.danger, 0.1),
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
                standardWarning: classes.standardWarning,
                standardError: classes.standardError,
                ...rest.classes,
            }}>
            {children}
        </Alert>
    )
}
