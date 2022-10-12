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
        emptyText: {
            color: theme.palette.text.secondary,
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
        },
    }),
)

export function ApprovalEmptyContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.emptyText)}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography>{t.no_approved_contract_records()}</Typography>
            </div>
        </div>
    )
}
