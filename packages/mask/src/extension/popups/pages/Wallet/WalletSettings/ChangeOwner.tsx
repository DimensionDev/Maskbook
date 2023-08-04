import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'

export function ChangeOwner() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()

    return (
        <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.ChangeOwner)}>
            <Box className={classes.itemBox}>
                <Icons.PersonasOutline size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_change_owner')}</Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
