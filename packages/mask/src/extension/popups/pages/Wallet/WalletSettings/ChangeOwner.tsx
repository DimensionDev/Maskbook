import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { useContainer } from 'unstated-next'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../utils/index.js'
import { WalletContext } from '../hooks/useWalletContext.js'
import { useStyles } from './useStyles.js'

export function ChangeOwner() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const wallet = useWallet()
    const wallets = useWallets()

    const { personaManagers } = useContainer(WalletContext)

    const walletManager = useMemo(
        () => wallets.find((x) => !x.owner && isSameAddress(wallet?.owner, x.address)),
        [wallets, wallet],
    )
    const personaManager = useMemo(
        () => personaManagers?.find((x) => isSameAddress(wallet?.owner, x.address)),
        [personaManagers, wallet],
    )

    return (
        <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.ChangeOwner)}>
            <Box className={classes.itemBox}>
                <Icons.PersonasOutline size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_change_owner')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{walletManager?.name ?? personaManager?.nickname}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
