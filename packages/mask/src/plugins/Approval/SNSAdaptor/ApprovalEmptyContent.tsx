import { useStyles } from './useStyles'
import { useI18N } from '../locales'
import { EmptySimpleIcon } from '@masknet/icons'
import { Typography } from '@mui/material'

export function ApprovalEmptyContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.emptyText)}>
                <EmptySimpleIcon className={classes.emptyIcon} />
                <Typography>{t.no_approved_contract_records()}</Typography>
            </div>
        </div>
    )
}
