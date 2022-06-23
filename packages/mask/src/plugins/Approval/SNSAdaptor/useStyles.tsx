import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        dialogRoot: {
            background: theme.palette.background.paper,
            width: 600,
            height: 620,
            overflowX: 'hidden',
        },
        dialogContent: {
            width: 568,
            padding: '12px 16px',
            margin: 'auto',
        },
        dialogTitle: {
            '& > p': {
                overflow: 'visible',
            },
        },
        abstractTabWrapper: {
            width: '100%',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(2),
        },
        tab: {
            height: 36,
            minHeight: 36,
        },
        tabPaper: {
            backgroundColor: 'inherit',
        },
        tabs: {
            width: 535,
            height: 36,
            minHeight: 36,
            padding: 0,
            maxWidth: '100%',
            margin: '0 auto',
            borderRadius: 4,
            '& .Mui-selected': {
                color: '#ffffff',
                backgroundColor: `${theme.palette.primary.main}!important`,
            },
        },
        indicator: {
            display: 'none',
        },
        tabPanel: {
            marginTop: 12,
        },
        approvalWrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
        },
        approvalContentWrapper: {
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        approvalEmptyOrLoadingWrapper: {
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        approvalEmptyOrLoadingContent: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
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
        listItem: {
            width: '100%',
            height: 90,
            padding: 12,
            borderRadius: 8,
            marginBottom: theme.spacing(1),
            background: props?.listItemBackground ?? theme.palette.background.default,
            '&:before': {
                position: 'absolute',
                content: '""',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: '100%',
                height: 90,
                background: props?.listItemBackgroundIcon,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '114px 114px',
            },
        },
    }),
)
