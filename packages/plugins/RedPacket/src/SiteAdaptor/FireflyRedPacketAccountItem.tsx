import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { ChainId, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { openWindow } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    linkIcon: {
        color: theme.palette.maskColor.secondaryMainDark,
        height: 16,
        width: 16,
    },
    linkButton: {
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        height: 16,
    },
}))

interface Props {
    address: string
    ens?: string
    chainId?: ChainId
}

export const FireflyRedPacketAccountItem = memo(function FireflyRedPacketAccountItem({
    address,
    ens,
    chainId = ChainId.Mainnet,
}: Props) {
    const { classes } = useStyles()
    return (
        <Box display="flex" gap="4px" alignItems="center">
            <Typography>{ens ? ens : formatEthereumAddress(address, 4)}</Typography>
            <button
                type="button"
                className={classes.linkButton}
                onClick={() => {
                    if (isValidAddress(address)) openWindow(EVMExplorerResolver.addressLink(chainId, address), '_blank')
                }}>
                <Icons.LinkOut className={classes.linkIcon} />
            </button>
        </Box>
    )
})
