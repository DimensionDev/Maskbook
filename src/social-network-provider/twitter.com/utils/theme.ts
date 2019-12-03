import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import { lighten } from '@material-ui/core/styles'

export const useTwitterButton = makeStyles((theme: Theme) => ({
    button: {
        fontWeight: 'bold',
        minHeight: 39,
        borderRadius: 9999,
        boxShadow: 'none',
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: theme.palette.primary.dark,
        },
        '&[disabled]': {
            boxShadow: 'none',
            opacity: 0.5,
            color: 'rgb(255, 255, 255)',
            backgroundColor: theme.palette.primary.light,
        },
    },
}))

export const useTwitterCloseButton = makeStyles((theme: Theme) => ({
    close: {
        color: theme.palette.primary.main,
        padding: 7,
        '&:hover': {
            backgroundColor: lighten(theme.palette.primary.main, 0.9),
        },
    },
}))
