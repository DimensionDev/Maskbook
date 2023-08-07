import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { useCallback } from 'react'
import { PopupModalRoutes } from '@masknet/shared-base'
import { useModalNavigate } from '../../../components/index.js'

export function ChangeNetwork() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const modalNavigate = useModalNavigate()

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    return (
        <ListItem className={classes.item} onClick={chooseNetwork}>
            <Box className={classes.itemBox}>
                <Icons.Globe size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_settings_change_network')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
