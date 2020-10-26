import React from 'react'
import { useSnackbar, SnackbarProvider } from 'notistack'
import { makeStyles, createStyles, useTheme } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: 795,
            height: 48,
        },
    }),
)

export interface DashboardSnackbarProps {
    key: string | number
    message: React.ReactNode
    children?: React.ReactNode
}

export const DashboardSnackbar = React.forwardRef<HTMLDivElement, DashboardSnackbarProps>(
    (props: DashboardSnackbarProps, ref) => {
        const { key, message } = props
        const classes = useStyles()
        const { closeSnackbar } = useSnackbar()
        const theme = useTheme()
        return (
            <div id={String(key)} className={classes.root} ref={ref}>
                {key}
                {theme.palette.primary.main}
                {message}
            </div>
        )
    },
)

import CheckIcon from '@material-ui/icons/Check'

export interface DashboardSnackbarProviderProps {
    children?: React.ReactNode
}

export function DashboardSnackbarProvider({ children }: DashboardSnackbarProviderProps) {
    return (
        <SnackbarProvider
            maxSnack={3}
            disableWindowBlurListener
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            // TODO:
            // iconVariant={{
            //     success: <CheckIcon />,
            // }}
            // Block by https://github.com/iamhosseindhv/notistack/pull/259
            // content={(key, message, ...props) => {
            //     return <DashboardSnackbar key={key} message={message} />
            // }}
        >
            {children}
        </SnackbarProvider>
    )
}
