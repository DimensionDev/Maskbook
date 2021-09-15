import { useCallback } from 'react'
import { Box, MenuItem, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ChainId, getChainIdFromNetworkType, ProviderType, resolveNetworkName } from '@masknet/web3-shared'
import { ChainIcon, useMenu } from '@masknet/shared'
import { useAsync } from 'react-use'
import { PluginServices } from '../../../../API'

const useStyles = makeStyles()((theme) => ({
    item: {
        '&:first-child': {
            marginTop: '12px',
        },
        '&:last-child': {
            marginBottom: '12px',
        },
    },
}))

export const useNetworkSelector = () => {
    const { classes } = useStyles()
    const { value: networks } = useAsync(async () => PluginServices.Wallet.getSupportedNetworks(), [])
    const onChainChange = useCallback((chainId: ChainId) => {
        PluginServices.Wallet.updateAccount({
            chainId,
            providerType: ProviderType.Maskbook,
        })
    }, [])

    console.log(networks)

    return useMenu(
        ...(networks?.map((network) => {
            const chainId = getChainIdFromNetworkType(network)

            return (
                <MenuItem
                    sx={{ mx: 2, py: 1 }}
                    classes={{ root: classes.item }}
                    key={network}
                    onClick={() => onChainChange(chainId)}>
                    <Box mr={1}>
                        <ChainIcon chainId={chainId} />
                    </Box>
                    <Typography>{resolveNetworkName(network)}</Typography>
                </MenuItem>
            )
        }) ?? []),
    )
}
