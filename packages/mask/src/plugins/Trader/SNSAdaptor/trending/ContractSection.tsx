import { Icons } from '@masknet/icons'
import { useChainDescriptor, useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { FormattedAddress, TokenIcon, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material'
import { useCopyToClipboard } from 'react-use'
import { noop } from 'lodash-es'

export interface ContractSectionProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    iconURL?: string
}

export const ContractSection = ({
    chainId,
    address,
    name,
    symbol,
    iconURL,
    pluginID = NetworkPluginID.PLUGIN_EVM,
}: ContractSectionProps) => {
    const theme = useTheme()
    const { Others } = useWeb3State(pluginID)
    const [, copyToClipboard] = useCopyToClipboard()
    const chain = useChainDescriptor(pluginID, chainId)

    const onCopyAddress = useSnackbarCallback(async () => {
        if (!address) return
        copyToClipboard(address)
    }, [address])

    return (
        <Stack direction="row" gap={0.5} display="flex" alignItems="center" justifyContent="flex-end">
            {chain?.nativeCurrency?.logoURL ? (
                <WalletIcon size={16} mainIcon={new URL(chain?.nativeCurrency.logoURL)} />
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
                onClick={chainId ? () => openWindow(Others?.explorerResolver.addressLink(chainId, address)) : noop}>
                <FormattedAddress address={address} size={4} formatter={Others?.formatAddress} />
            </Typography>
            <IconButton sx={{ padding: 0 }} color="primary" size="small" onClick={onCopyAddress}>
                <Icons.PopupCopy size={16} color={theme.palette.maskColor?.second} />
            </IconButton>
        </Stack>
    )
}
