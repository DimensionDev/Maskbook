import { Icons } from '@masknet/icons'
import { useWallet } from '@masknet/web3-hooks-base'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { WalletRenameModal } from '../../../modals/modals.js'

export function Rename() {
    const { t } = useI18N()
    const wallet = useWallet()
    const theme = useTheme()
    const { classes } = useStyles()

    if (!wallet) return null

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletRenameModal.open({
                    wallet,
                    title: t('rename'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('rename')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{wallet.name}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
