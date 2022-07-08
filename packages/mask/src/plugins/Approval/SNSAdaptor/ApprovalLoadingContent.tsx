import { useStyles } from './useStyles'
import { useI18N } from '../locales'
import { CircleLoadingIcon } from '@masknet/icons'
import { Typography } from '@mui/material'

export function ApprovalLoadingContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.loadingText)}>
                <CircleLoadingIcon className={classes.loadingIcon} />
                <Typography>{t.loading()}</Typography>
            </div>
        </div>
    )
}
