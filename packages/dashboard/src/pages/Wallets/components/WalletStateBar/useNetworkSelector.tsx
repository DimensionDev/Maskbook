import { useCallback } from 'react'
import { MenuItem, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    useAccount,
    useChainId,
    useWeb3StateContext,
} from '@masknet/web3-shared-evm'
import { ChainIcon, useMenu, useRemoteControlledDialog } from '@masknet/shared'
import { useAsync } from 'react-use'
import { PluginMessages, PluginServices } from '../../../../API'
import { SuccessIcon } from '@masknet/icons'
import { noop } from 'lodash-es'

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
    const account = useAccount()
    const { providerType } = useWeb3StateContext()

    const { value: networks } = useAsync(async () => PluginServices.Wallet.getSupportedNetworks(), [])

    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.connectWalletDialogUpdated,
    )

    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            switch (providerType) {
                case ProviderType.MaskWallet:
                    await PluginServices.Wallet.updateAccount({
                        account,
                        chainId,
                        providerType: ProviderType.MaskWallet,
                    })
                    await PluginServices.Wallet.updateMaskAccount({
                        account,
                        chainId,
                    })
                    break
                case ProviderType.MetaMask:
                case ProviderType.WalletConnect:
                case ProviderType.Fortmatic:
                    setConnectWalletDialog({
                        open: true,
                        providerType,
                        networkType: getNetworkTypeFromChainId(chainId) ?? NetworkType.Ethereum,
                    })
                    break
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
                default:
                    throw new Error('Unreachable case:' + providerType)
            }
        },
        [providerType, account],
    )

    const networkMenu = useMenu(
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
                        <Stack justifyContent="center" alignItems="center" width={30}>
                            <ChainIcon chainId={chainId} size={30} />
                        </Stack>
                        <Typography flex={1}>{resolveNetworkName(network)}</Typography>
                    </Stack>
                </MenuItem>
            )
        }) ?? []),
    )

    if ([ProviderType.WalletConnect || ProviderType.CustomNetwork].includes(providerType)) {
        return [null, noop] as const
    }

    return networkMenu
}
