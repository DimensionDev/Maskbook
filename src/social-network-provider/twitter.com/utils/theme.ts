import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

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
            backgroundColor: theme.palette.primary.light,
        },
    },
}))
