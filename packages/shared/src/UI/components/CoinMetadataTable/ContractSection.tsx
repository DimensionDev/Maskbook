import { useNetworkDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CopyButton, FormattedAddress, TokenIcon, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { Box, Stack, Typography } from '@mui/material'

interface ContractSectionProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    iconURL?: string
    fullAddress?: boolean
    align?: 'flex-end' | 'flex-start'
}

export function ContractSection({
    chainId,
    address,
    name,
    symbol,
    iconURL,
    pluginID = NetworkPluginID.PLUGIN_EVM,
    fullAddress,
    align = 'flex-end',
}: ContractSectionProps) {
    const Utils = useWeb3Utils(pluginID)
    const chain = useNetworkDescriptor(pluginID ?? NetworkPluginID.PLUGIN_EVM, chainId)

    return (
        <Stack direction="row" gap={0.5} display="flex" alignItems="center" justifyContent={align}>
            {chain ?
                <WalletIcon mainIcon={chain.icon} size={14} />
            : iconURL ?
                <TokenIcon logoURL={iconURL} address={address} name={name} symbol={symbol} size={16} disableBadge />
            :   <Box width={16} />}
            <Typography
                variant="body2"
                component="a"
                fontWeight={700}
                fontSize={fullAddress ? 12 : 14}
                href={chainId ? Utils.explorerResolver.addressLink(chainId, address) : undefined}
                target="_blank"
                sx={{ color: 'text.primary', textDecoration: 'none' }}>
                <FormattedAddress
                    address={address}
                    size={fullAddress ? undefined : 4}
                    formatter={Utils.formatAddress}
                />
            </Typography>
            <CopyButton size={16} text={address} scoped={false} />
        </Stack>
    )
}
