import { Icons } from '@masknet/icons'
import { Typography, Box } from '@mui/material'
import useStyles from './useStyles'
import { useI18N } from '../locales'

export function LoadingContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <Box className={classes.root}>
            <div className={classes.preWrapper}>
                <div className={cx(classes.preContent, classes.loadingText)}>
                    <Icons.CircleLoading className={classes.loadingIcon} />
                    <Typography>{t.loading()}</Typography>
                </div>
            </div>
        </Box>
    )
}
