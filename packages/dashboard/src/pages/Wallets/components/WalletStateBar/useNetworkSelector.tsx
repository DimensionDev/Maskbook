import { useCallback } from 'react'
import { MenuItem, Stack, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    getChainIdFromNetworkType,
    ProviderType,
    resolveNetworkName,
    useChainId,
    useNetworkType,
    useWeb3StateContext,
} from '@masknet/web3-shared'
import { ChainIcon, useMenu, useRemoteControlledDialog } from '@masknet/shared'
import { useAsync } from 'react-use'
import { PluginMessages, PluginServices } from '../../../../API'
import { SuccessIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    item: {
        paddingLeft: 8,
        paddingRight: 8,
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
    const currentChainId = useChainId()
    const networkType = useNetworkType()
    const { providerType } = useWeb3StateContext()

    const { value: networks } = useAsync(async () => PluginServices.Wallet.getSupportedNetworks(), [])

    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.connectWalletDialogUpdated,
    )

    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            switch (providerType) {
                case ProviderType.Maskbook:
                    await PluginServices.Wallet.updateAccount({
                        chainId,
                        providerType: ProviderType.Maskbook,
                    })
                    break
                case ProviderType.MetaMask:
                case ProviderType.WalletConnect:
                    setConnectWalletDialog({
                        open: true,
                        providerType,
                        networkType: networkType,
                    })
                    break
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
            }
        },
        [providerType],
    )

    return useMenu(
        ...(networks?.map((network) => {
            const chainId = getChainIdFromNetworkType(network)

            return (
                <MenuItem
                    sx={{ mx: 2, py: 1 }}
                    classes={{ root: classes.item }}
                    key={network}
                    onClick={() => onChainChange(chainId)}>
                    <Stack direction="row" gap={0.5} alignItems="center">
                        <Stack justifyContent="center" width={18}>
                            {chainId === currentChainId && <SuccessIcon sx={{ fontSize: 18 }} />}
                        </Stack>
                        <ChainIcon chainId={chainId} size={30} />
                        <Typography flex={1}>{resolveNetworkName(network)}</Typography>
                    </Stack>
                </MenuItem>
            )
        }) ?? []),
    )
}
