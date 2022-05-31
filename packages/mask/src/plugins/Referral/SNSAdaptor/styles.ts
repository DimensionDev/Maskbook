import { makeStyles } from '@masknet/theme'

export const useTabStyles = makeStyles()((theme) => ({
    root: {
        fontSize: '1rem',
    },
}))

export const useSharedStyles = makeStyles()((theme) => ({
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
    msg: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: theme.palette.background.default,
        padding: '12px 0',
        color: theme.palette.text.strong,
        fontWeight: 500,
        textAlign: 'center',
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
}))

export const useStylesAccordion = makeStyles()((theme) => {
    const isDarkMode = theme.palette.mode === 'dark'
    return {
        accordion: {
            marginBottom: '20px',
            width: '100%',
            background: 'transparent',
            ':first-of-type': {
                borderRadius: 0,
            },
            ':before': {
                height: 0,
                opacity: 0,
            },
        },
        accordionSummary: {
            margin: 0,
            padding: 0,
        },
        accordionSummaryContent: {
            margin: '0px!important',
        },
        accordionDetails: {
            marginTop: '8px',
            padding: '8px',
            background: isDarkMode ? '#15171A' : theme.palette.background.default,
            borderRadius: '4px',
        },
        container: {
            fontWeight: 400,
        },
    }
})
