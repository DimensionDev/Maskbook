import { LiveIcon } from '../icons/LiveIcon'
import { Typography } from '@mui/material'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    icon: {
        height: 10,
        width: 10,
        fill: 'red',
        marginRight: theme.spacing(0.5),
    },
}))

export function Live() {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Typography>
            <LiveIcon className={classes.icon} />
            {t('plugin_azuro_live')}
        </Typography>
    )
}
