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

export const useTwitterDialog = makeStyles((theme: Theme) => {
    const { type, grey } = theme.palette
    const borderColor = type === 'dark' ? grey[800] : grey[200]
    return {
        MUIInputInput: {
            borderStyle: 'none',
        },
        dialog: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        backdrop: {
            backgroundColor: `${type === 'dark' ? 'rgba(110, 118, 125, 0.3)' : 'rgba(0, 0, 0, 0.3)'} !important`,
        },
        paper: {
            borderRadius: 14,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: `1px solid ${borderColor}`,
        },
        title: {
            verticalAlign: 'middle',
        },
    }
})
