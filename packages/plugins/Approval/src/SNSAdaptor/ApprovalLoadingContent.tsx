import { useI18N } from '../locales/index.js'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        approvalEmptyOrLoadingWrapper: {
            flexGrow: 1,
            width: '100%',
            height: 360,
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
    }),
)

export function ApprovalLoadingContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.loadingText)}>
                <Icons.CircleLoading className={classes.loadingIcon} />
                <Typography>{t.loading()}</Typography>
            </div>
        </div>
    )
}
