import { forwardRef } from 'react'
import { Alert, AlertProps } from '@mui/material'
import { makeStyles } from '../../UIHelper/makeStyles'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    message: {
        fontSize: 14,
        fontWeight: 400,
    },
    standardWarning: {
        color: '#FFB100',
    },
    standardError: {
        color: '#FF3545',
    },
}))

export interface MaskAlertProps extends AlertProps {}

export const MaskAlert = forwardRef((props: MaskAlertProps) => {
    const { children, ...rest } = props
    const { classes } = useStyles()

    return (
        <Alert {...rest} classes={classes}>
            {children}
        </Alert>
    )
})
