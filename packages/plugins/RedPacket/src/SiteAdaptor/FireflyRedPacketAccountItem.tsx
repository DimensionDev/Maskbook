import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { ChainId, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ENS, EVMExplorerResolver } from '@masknet/web3-providers'
import { openWindow } from '@masknet/shared-base-ui'
import { useAsync } from 'react-use'

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
    chainId?: ChainId
}

export const FireflyRedPacketAccountItem = memo(function FireflyRedPacketAccountItem({
    addressOrEns,
    chainId = ChainId.Mainnet,
}: Props) {
    const { classes } = useStyles()
    const { value: address } = useAsync(
        async () => (isValidAddress(addressOrEns) ? addressOrEns : ENS.lookup(addressOrEns)),
        [addressOrEns],
    )

    return (
        <Box display="flex" gap="4px" alignItems="center">
            <Typography>
                {isValidAddress(addressOrEns) ? formatEthereumAddress(addressOrEns, 4) : addressOrEns}
            </Typography>
            <button
                type="button"
                className={classes.linkButton}
                onClick={() => {
                    if (isValidAddress(address))
                        openWindow(EVMExplorerResolver.addressLink(chainId, '_blank'), addressOrEns)
                }}>
                <Icons.LinkOut className={classes.linkIcon} />
            </button>
        </Box>
    )
})
