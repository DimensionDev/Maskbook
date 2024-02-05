import { memo, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ENS , EVMExplorerResolver } from '@masknet/web3-providers'
import { openWindow } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    linkIcon: {
        color: theme.palette.maskColor.second,
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
    addressOrEns: string
    chainId?: string
}

export const FireflyRedPacketAccountItem = memo(function FireflyRedPacketAccountItem({ addressOrEns, chainId }: Props) {
    const { classes } = useStyles()
    const handleClick = useCallback(async () => {
        if (isValidAddress(addressOrEns))
            openWindow(EVMExplorerResolver.addressLink(chainId ? Number(chainId) : 1, '_blank'), addressOrEns)
        else {
            const address = await ENS.lookup(addressOrEns)
            if (address) openWindow(EVMExplorerResolver.addressLink(chainId ? Number(chainId) : 1, '_blank'), address)
        }
    }, [addressOrEns, chainId])

    return (
        <Box display="flex" gap="4px" alignItems="center">
            <Typography>
                {isValidAddress(addressOrEns) ? formatEthereumAddress(addressOrEns, 4) : addressOrEns}
            </Typography>
            <button
                type="button"
                className={classes.linkButton}
                onClick={() => {
                    handleClick()
                }}>
                <Icons.LinkOut className={classes.linkIcon} />
            </button>
        </Box>
    )
})
