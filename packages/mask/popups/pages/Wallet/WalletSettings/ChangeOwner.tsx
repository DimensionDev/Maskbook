import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useStyles } from './useStyles.js'
import { useQuery } from '@tanstack/react-query'
import Services from '#services'
import { Trans } from '@lingui/macro'

export function ChangeOwner() {
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const wallet = useWallet()
    const wallets = useWallets()

    const { data: personaManagers } = useQuery({
        queryKey: ['persona-managers'],
        queryFn: async () => {
            return Services.Identity.queryOwnedPersonaInformation(true)
        },
        networkMode: 'always',
    })

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
                <Typography className={classes.itemText}>
                    <Trans>Change Owner</Trans>
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={cx(classes.itemText, classes.ellipsis)}>
                    {walletManager?.name ?? personaManager?.nickname}
                </Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
