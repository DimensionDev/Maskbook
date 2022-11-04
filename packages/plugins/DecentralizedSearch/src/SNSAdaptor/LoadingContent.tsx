import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { useI18N } from '../locales/index.js'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme) => {
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
        loadingText: {
            color: theme.palette.maskColor.dark,
            fontSize: 14,
        },
        loadingIcon: {
            width: 24,
            height: 24,
            marginBottom: 5,
            color: theme.palette.maskColor.dark,
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
    }
})

export function LoadingContent() {
    const { classes, cx } = useStyles({})

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
