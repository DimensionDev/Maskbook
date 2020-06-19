import { makeStyles } from '@material-ui/core/styles'
import { Theme, fade } from '@material-ui/core'

export const useTwitterButton = makeStyles((theme: Theme) => ({
    button: {
        fontWeight: 'bold',
        minHeight: 39,
        borderRadius: 9999,
        boxShadow: 'none',
        textTransform: 'initial',
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
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            '&': {
                height: '28px !important',
                minHeight: 'auto !important',
                padding: '0 14px !important',
            },
        },
    },
}))

export const useTwitterCloseButton = makeStyles((theme: Theme) => ({
    close: {
        color: theme.palette.primary.main,
        padding: 7,
        '&:hover': {
            backgroundColor: fade(theme.palette.primary.main, 0.1),
        },
    },
}))

export const useTwitterDialog = makeStyles((theme: Theme) => {
    return {
        MUIInputInput: {
            borderStyle: 'none',
            lineHeight: 1.3125, // copy from native composing dialog
        },
        dialog: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'block !important',
            },
        },
        container: {
            alignItems: 'center',
        },
        paper: {
            width: '600px !important',
            borderRadius: 14,
            boxShadow: 'none',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'block !important',
                    borderRadius: '0 !important',
                },
            },
        },
        backdrop: {
            backgroundColor: `${
                theme.palette.type === 'dark' ? 'rgba(110, 118, 125, 0.3)' : 'rgba(0, 0, 0, 0.3)'
            } !important`,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#ccd6dd'}`,
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px 11px !important',
                },
            },
        },
        content: {
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px !important',
                },
            },
        },
        actions: {
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px !important',
                },
            },
        },
        title: {
            verticalAlign: 'middle',
        },
    }
})

export const useTwitterMaskbookIcon = makeStyles((theme: Theme) => ({
    img: {
        width: 20,
        height: 20,
        padding: 8,
    },
}))

export const useTwitterBanner = makeStyles((theme: Theme) => ({
    root: {
        borderRadius: 0,
        borderStyle: 'solid none none none',
        borderTop: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#e6ecf0'}`,
        paddingBottom: 10,
        marginBottom: 0,
        boxShadow: 'none',
    },
    actions: {
        padding: '0 17px',
    },
}))

export const useTwitterLabel = makeStyles({
    label: {
        fontSize: 12,
    },
})
