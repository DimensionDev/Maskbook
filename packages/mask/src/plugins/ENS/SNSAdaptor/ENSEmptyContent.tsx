import useStyles from './useStyles'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'

export function ENSEmptyContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.preWrapper}>
            <div className={classes.preContent}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t.empty()}</Typography>
            </div>
        </div>
    )
}
