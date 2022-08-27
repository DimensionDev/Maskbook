import { Typography } from '@mui/material'
import { ActionButton } from '@masknet/theme'
import useStyles from './useStyles'
import { useI18N } from '../locales'

export function ENSLoadFailedContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.preWrapper}>
            <div className={cx(classes.preContent, classes.loadFailedText)}>
                <Typography>{t.load_failed()}</Typography>
                <ActionButton onClick={() => {}} loading={false} variant="roundedDark" className={classes.reloadButton}>
                    {t.reload()}
                </ActionButton>
            </div>
        </div>
    )
}
