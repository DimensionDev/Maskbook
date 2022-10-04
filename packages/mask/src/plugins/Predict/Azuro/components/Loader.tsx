import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme, props) => ({
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        width: '100%',
    },
    loading: {
        fontSize: 14,
        color: theme.palette.text.primary,
        lineHeight: '18px',
        marginTop: 12,
    },
    animated: {
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
}))

export function Loader() {
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.placeholder}>
            <Icons.CircleLoading size={36} className={classes.animated} />
            <Typography className={classes.loading}>{t('popups_loading')}</Typography>
        </div>
    )
}
