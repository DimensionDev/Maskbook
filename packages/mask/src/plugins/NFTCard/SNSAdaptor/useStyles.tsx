import { makeStyles, parseColor } from '@masknet/theme'

export const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        dialogRoot: {
            width: 800,
            height: 800,
            overflowX: 'hidden',
        },
        dialogContent: {
            width: '100%',
            background: theme.palette.maskColor.bottom,
            padding: 0,
            height: '100%',
            overflowX: 'hidden',
        },
        dialogTitle: {
            '& > p': {
                overflow: 'visible',
            },
        },
        contentWrapper: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        contentLayout: {
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: 24,
            gap: 36,
            boxSizing: 'border-box',
        },
        NFTBasicInfoWraper: {
            width: 300,
        },
        abstractTabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        tab: {
            height: 36,
            minHeight: 36,
        },
        tabPaper: {
            backgroundColor: 'inherit',
        },
        indicator: {
            display: 'none',
        },
        tabPanel: {
            marginTop: 12,
        },
        emptyText: {
            color: theme.palette.text.secondary,
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
        },
        loadingIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
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
        loadingText: {
            color: theme.palette.text.primary,
        },
        listItemWrapper: {
            width: '100%',
            height: 90,
            padding: 0,
            marginTop: 4,
            background: theme.palette.common.white,
            borderRadius: 8,
            marginBottom: theme.spacing(1),
        },
        listItem: {
            width: '100%',
            height: 90,
            padding: 12,
            borderRadius: 8,
            marginBottom: 0,
            background: props?.listItemBackground ?? theme.palette.background.default,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:before': {
                position: 'absolute',
                content: '""',
                top: 30,
                left: 381,
                zIndex: 0,
                width: 114,
                opacity: 0.2,
                height: 61,
                filter: 'blur(1.5px)',
                background: props?.listItemBackgroundIcon,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '114px 114px',
            },
        },
        listItemInfo: {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            '& > div': {
                display: 'flex',
            },
        },
        logoIcon: {
            borderRadius: 999,
            width: 18,
            height: 18,
            marginRight: '4px !important',
        },
        spenderLogoIcon: {
            width: 16,
            height: 16,
            marginRight: 4,
        },
        link: {
            width: 16,
            height: 16,
        },
        linkOutIcon: {
            color: theme.palette.maskColor.secondaryDark,
            marginLeft: 2,
        },
        spenderMaskLogoIcon: {
            display: 'inline-block',
            marginRight: 4,
            width: 16,
            height: 16,
            '& > svg': {
                width: 16,
                height: 16,
            },
            '& > span': {
                width: 16,
                height: 16,
            },
        },
        contractInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        primaryText: {
            fontSize: 14,
            fontWeight: 700,
            marginRight: 4,
            color: theme.palette.maskColor.dark,
        },
        secondaryText: {
            fontSize: 14,
            fontWeight: 400,
            marginRight: 4,
            color: theme.palette.maskColor.secondaryDark,
        },
        footer: {
            boxShadow:
                theme.palette.mode === 'dark'
                    ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                    : '0px 0px 20px rgba(0, 0, 0, 0.05)',
            position: 'sticky',
            bottom: 0,
        },
        button: {
            width: 80,
            height: 32,
            fontSize: 12,
            color: theme.palette.common.white,
            background: theme.palette.common.black,
            flex: 'initial !important',
            '&:disabled': {
                color: theme.palette.common.white,
            },
            '&:hover': {
                color: theme.palette.common.white,
                background: theme.palette.common.black,
                boxShadow: `0 8px 25px ${parseColor(theme.palette.common.black).setAlpha(0.3).toRgbString()}`,
            },
        },
        chainBoundary: {
            width: 'auto !important',
        },
    }),
)
