import { memo, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { ENS } from '@masknet/web3-providers'
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
    const Utils = useWeb3Utils()
    const handleClick = useCallback(async () => {
        if (web3_utils.isAddress(addressOrEns))
            openWindow(Utils.explorerResolver.addressLink(chainId ? Number(chainId) : 1, '_blank'), addressOrEns)
        else {
            const address = await ENS.lookup(addressOrEns)
            if (address)
                openWindow(Utils.explorerResolver.addressLink(chainId ? Number(chainId) : 1, '_blank'), address)
        }
    }, [addressOrEns, chainId])

    return (
        <Box display="flex" gap="4px" alignItems="center">
            <Typography>
                {web3_utils.isAddress(addressOrEns) ? formatEthereumAddress(addressOrEns, 4) : addressOrEns}
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
