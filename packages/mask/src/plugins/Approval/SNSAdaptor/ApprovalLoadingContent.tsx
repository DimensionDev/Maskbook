import { useStyles } from './useStyles.js'
import { useI18N } from '../locales/index.js'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'

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
