import { makeStyles } from '@material-ui/core/styles'
import { Theme, fade } from '@material-ui/core'

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
            '& > h2': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
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
            padding: '10px 15px',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px !important',
                },
            },
        },
        title: {
            verticalAlign: 'middle',
            marginLeft: 6,
        },
    }
})

export const useTwitterMaskbookIcon = makeStyles((theme: Theme) => ({
    img: {
        width: 38,
        height: 38,
        boxSizing: 'border-box',
        padding: theme.spacing(1),
    },
}))
