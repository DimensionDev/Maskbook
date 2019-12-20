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
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
        },
    },
}))

export const useTwitterDialog = makeStyles((theme: Theme) => {
    return {
        MUIInputInput: {
            borderStyle: 'none',
        },
        dialog: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'block !important',
            },
        },
        paper: {
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

export const useTwitterBanner = makeStyles((theme: Theme) => ({
    root: {
        border: 'none',
        borderRadius: 0,
        borderTopStyle: 'solid',
    },
    actions: {
        padding: '0 17px',
    },
}))
