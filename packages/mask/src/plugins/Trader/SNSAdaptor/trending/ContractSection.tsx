import { Icons } from '@masknet/icons'
import { useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { FormattedAddress, TokenIcon, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material'
import { useCopyToClipboard } from 'react-use'

export interface ContractSectionProps {
    chainId?: ChainId
    address: string
    iconURL?: string
}

export const ContractSection = ({ address, chainId, iconURL }: ContractSectionProps) => {
    const theme = useTheme()
    const [, copyToClipboard] = useCopyToClipboard()
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)

    const onCopyAddress = useSnackbarCallback(async () => {
        if (!address) return
        copyToClipboard(address)
    }, [address])

    return (
        <Stack direction="row" gap={0.5} display="flex" alignItems="center" justifyContent="flex-end">
            {chainId ? (
                <WalletIcon size={16} mainIcon={chain?.icon} />
            ) : iconURL ? (
                <TokenIcon AvatarProps={{ sx: { width: 16, height: 16 } }} logoURL={iconURL} address={address} />
            ) : (
                <Box width={16} />
            )}
            <Typography variant="body2" component="span" fontWeight={700}>
                <FormattedAddress address={address} size={4} formatter={formatEthereumAddress} />
            </Typography>
            <IconButton sx={{ padding: 0 }} color="primary" size="small" onClick={onCopyAddress}>
                <Icons.PopupCopy size={16} color={theme.palette.maskColor?.second} />
            </IconButton>
        </Stack>
    )
}
