import { forwardRef } from 'react'
import { SnackbarProvider } from '@masknet/theme'
import { useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    root: {
        width: 795,
        height: 48,
    },
})

export interface DashboardSnackbarProps {
    key: string | number
    message: React.ReactNode
    children?: React.ReactNode
}

export const DashboardSnackbar = forwardRef<HTMLDivElement, DashboardSnackbarProps>(
    (props: DashboardSnackbarProps, ref) => {
        const { key, message } = props
        const { classes } = useStyles()
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
