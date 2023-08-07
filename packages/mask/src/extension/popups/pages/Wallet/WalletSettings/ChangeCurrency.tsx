import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { useCallback } from 'react'
import { PopupModalRoutes } from '@masknet/shared-base'
import { useModalNavigate } from '../../../components/index.js'
import { useCurrencyType } from '@masknet/web3-hooks-base'
import { resolveCurrencyName } from '@masknet/web3-shared-base'

export function ChangeCurrency() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()

    const modalNavigate = useModalNavigate()

    const chooseCurrency = useCallback(() => {
        modalNavigate(PopupModalRoutes.ChooseCurrency)
    }, [modalNavigate])

    const currencyType = useCurrencyType()

    return (
        <ListItem className={classes.item} onClick={chooseCurrency}>
            <Box className={classes.itemBox}>
                <Icons.Currency size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('currency')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                {currencyType ? (
                    <Typography className={classes.itemText}>{resolveCurrencyName(currencyType)}</Typography>
                ) : null}
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
