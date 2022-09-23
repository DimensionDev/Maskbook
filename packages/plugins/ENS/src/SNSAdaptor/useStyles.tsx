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
        coverIcon: {
            width: '100%',
            height: 'auto',
        },
        coverCard: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 256,
            marginBottom: 12,
            backgroundImage: `url(${new URL('./assets/ENSCover.svg', import.meta.url)})`,
            backgroundSize: 'contain',
        },
        coverText: {
            fontSize: 24,
            fontWeight: 700,
            width: '100%',
            textAlign: 'center',
            color: theme.palette.common.white,
        },
        nextIdVerified: {
            display: 'flex',
            alignItems: 'center',
            margin: '0px 12px 28px',
        },
        nextIdVerifiedTitle: {
            color: theme.palette.maskColor.secondaryDark,
            marginRight: 12,
            fontSize: 16,
        },
        nextIdVerifiedTwitterName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            marginLeft: 4,
            fontSize: 16,
        },
        rightSpace: {
            marginRight: 12,
        },
        sourceSwitcher: {
            display: 'flex',
            justifyContent: 'right',
            marginBottom: 13,
        },
        sourceNote: {
            fontSize: 14,
            fontWeight: '400 !important',
            color: theme.palette.maskColor.secondaryDark,
        },
        link: {
            display: 'flex',
            textDecoration: 'none !important',
        },
        nextIdLink: {
            color: theme.palette.maskColor.primary,
            textDecoration: 'none !important',
        },
        more: {
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        socialAccountListItem: {
            width: 193,
            padding: '12px 6px',
            margin: '6px 12px',
            display: 'flex',
            alignItems: 'center',
        },
        menuItemNextIdIcon: {
            display: 'flex',
            marginLeft: 'auto',
        },
        accountNameInList: {
            maxWidth: 120,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
    }
})

export default useStyles
