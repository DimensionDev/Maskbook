import useStyles from './useStyles'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { Typography, Box } from '@mui/material'
import { ENSPostExtraInfoWrapper } from './ENSPostExtraInfoWrapper'

export function EmptyContent() {
    const { classes, cx } = useStyles({})

    const t = useI18N()
    return (
        <ENSPostExtraInfoWrapper>
            <Box className={classes.root}>
                <div className={classes.preWrapper}>
                    <div className={classes.preContent}>
                        <Icons.EmptySimple className={classes.emptyIcon} />
                        <Typography className={classes.emptyText}>{t.empty()}</Typography>
                    </div>
                </div>
            </Box>
        </ENSPostExtraInfoWrapper>
    )
}
