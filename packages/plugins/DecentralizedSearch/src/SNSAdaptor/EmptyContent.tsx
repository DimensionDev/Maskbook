import { useI18N } from '../locales/index.js'
import { Icons } from '@masknet/icons'
import { Typography, Box } from '@mui/material'
import { DecentralizedSearchPostExtraInfoWrapper } from './DecentralizedSearchPostExtraInfoWrapper.js'
import { makeStyles } from '@masknet/theme'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isMenuScroll = false }) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        preWrapper: {
            flexGrow: 1,
            width: '100%',
            height: 148,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        preContent: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
        },
        emptyText: {
            color: theme.palette.maskColor.secondaryDark,
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
        },
    }
})

export function EmptyContent() {
    const { classes } = useStyles({})

    const t = useI18N()
    return (
        <DecentralizedSearchPostExtraInfoWrapper>
            <Box className={classes.root}>
                <div className={classes.preWrapper}>
                    <div className={classes.preContent}>
                        <Icons.EmptySimple className={classes.emptyIcon} />
                        <Typography className={classes.emptyText}>{t.empty()}</Typography>
                    </div>
                </div>
            </Box>
        </DecentralizedSearchPostExtraInfoWrapper>
    )
}
