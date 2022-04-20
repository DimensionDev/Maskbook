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
