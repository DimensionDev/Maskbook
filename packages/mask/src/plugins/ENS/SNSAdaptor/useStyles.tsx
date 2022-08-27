import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        preWrapper: {
            flexGrow: 1,
            width: '100%',
            height: 148,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        preContent: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
        },
        loadingText: {
            color: theme.palette.text.primary,
            fontSize: 14,
        },
        loadFailedText: {
            color: theme.palette.maskColor.danger,
            fontSize: 14,
        },
        loadingIcon: {
            width: 24,
            height: 24,
            marginBottom: 5,
            '@keyframes loadingAnimation': {
                '0%': {
                    transform: 'rotate(0deg)',
                },
                '100%': {
                    transform: 'rotate(360deg)',
                },
            },
            animation: 'loadingAnimation 1s linear infinite',
        },
        reloadButton: {
            width: 254,
            marginTop: 26,
        },
        emptyText: {
            color: theme.palette.maskColor.secondaryDark,
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
        },
    }
})

export default useStyles
