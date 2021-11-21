import { useCallback } from 'react'
import { noop } from 'lodash-unified'
import { MenuItem, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
    useAccount,
    useChainId,
    useWeb3StateContext,
} from '@masknet/web3-shared-evm'
import { SuccessIcon } from '@masknet/icons'
import { WalletIcon, useMenu, useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages, PluginServices } from '../../../../API'
import { useNetworkDescriptors } from '@masknet/plugin-infra'

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
    const networkDescriptors = useNetworkDescriptors()

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
        ...(networkDescriptors
            ?.filter((x) => x.isMainnet)
            .map((network) => {
                const chainId = network.chainId

                return (
                    <MenuItem
                        sx={{ mx: 2, py: 1 }}
                        classes={{ root: classes.item }}
                        key={network.ID}
                        onClick={() => onChainChange(chainId)}>
                        <Stack direction="row" gap={0.5} alignItems="center">
                            <Stack justifyContent="center" width={18}>
                                {chainId === currentChainId && <SuccessIcon sx={{ fontSize: 18 }} />}
                            </Stack>
                            <Stack justifyContent="center" alignItems="center" width={30}>
                                <WalletIcon networkIcon={network.icon} size={30} />
                            </Stack>
                            <Typography flex={1}>{network.name}</Typography>
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
