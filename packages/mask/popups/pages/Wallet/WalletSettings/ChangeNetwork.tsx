import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useStyles } from './useStyles.js'
import { useCallback } from 'react'
import { PopupModalRoutes } from '@masknet/shared-base'
import { useModalNavigate } from '../../../components/index.js'
import { Trans } from '@lingui/macro'

export function ChangeNetwork() {
    const { classes, theme } = useStyles()
    const modalNavigate = useModalNavigate()

    const chooseNetwork = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseNetwork)
    }, [modalNavigate])

    return (
        <ListItem className={classes.item} onClick={chooseNetwork}>
            <Box className={classes.itemBox}>
                <Icons.Globe size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Change Network</Trans>
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
