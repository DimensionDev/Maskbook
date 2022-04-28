import { makeStyles } from '@masknet/theme'

export const useTabStyles = makeStyles()((theme) => ({
    root: {
        fontSize: '1rem',
    },
}))

export const useSharedStyles = makeStyles()((theme) => ({
    switchButton: {
        width: '100%',
        height: '41px',
        fontSize: '0.9375rem',
        marginTop: 0,
    },
    maxChip: {
        border: '1px solid #1D9BF0',
        background: 'transparent',
        borderRadius: '8px',
        height: '24px',
        marginLeft: '8px',
        color: '#1D9BF0',
        '&:hover': {
            color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
        },
    },
}))

export const useMyFarmsStyles = makeStyles()((theme) => ({
    container: {
        lineHeight: '22px',
        fontWeight: 300,
        '& > div::-webkit-scrollbar': {
            width: '7px',
        },
        '& > div::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '& > div::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: theme.palette.background.default,
        },
    },
    col: {
        color: theme.palette.text.secondary,
        fontWeight: 500,
    },
    content: {
        height: 320,
        overflowY: 'scroll',
        marginTop: 20,
        color: theme.palette.text.strong,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heading: {
        paddingRight: '27px',
    },
    noFarm: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: theme.palette.background.default,
        height: '44px',
        color: theme.palette.text.strong,
        fontWeight: 500,
    },
}))
