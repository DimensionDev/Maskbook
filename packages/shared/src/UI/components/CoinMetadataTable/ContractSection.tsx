import { noop } from 'lodash-es'
import { useNetworkDescriptor, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CopyButton, FormattedAddress, TokenIcon, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { Box, Stack, Typography } from '@mui/material'

export interface ContractSectionProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    iconURL?: string
}

export function ContractSection({
    chainId,
    address,
    name,
    symbol,
    iconURL,
    pluginID = NetworkPluginID.PLUGIN_EVM,
}: ContractSectionProps) {
    const Others = useWeb3Others(pluginID)
    const chain = useNetworkDescriptor(pluginID ?? NetworkPluginID.PLUGIN_EVM, chainId)

    return (
        <Stack direction="row" gap={0.5} display="flex" alignItems="center" justifyContent="flex-end">
            {chain ? (
                <WalletIcon mainIcon={chain?.icon} size={14} />
            ) : iconURL ? (
                <TokenIcon
                    logoURL={iconURL}
                    address={address}
                    name={name}
                    symbol={symbol}
                    AvatarProps={{ style: { width: 16, height: 16 } }}
                />
            ) : (
                <Box width={16} />
            )}
            <Typography
                variant="body2"
                component="span"
                fontWeight={700}
                fontSize={14}
                sx={{
                    cursor: 'pointer',
                }}
                onClick={chainId ? () => openWindow(Others.explorerResolver.addressLink(chainId, address)) : noop}>
                <FormattedAddress address={address} size={4} formatter={Others.formatAddress} />
            </Typography>
            <CopyButton size={16} text={address} />
        </Stack>
    )
}
