import { Button, ListItemIcon, MenuItem } from '@mui/material'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Unchecked, Checked } from '@masknet/icons'
import { useI18N } from '../../i18n-next-ui'
import { resolveNextIdPlatformPluginId, NetworkPluginID } from '@masknet/web3-shared-base'
import type { NextIDPlatform } from '@masknet/shared-base'
import { useWalletName } from './hooks/useWalletName'
import {
    useCurrentWeb3NetworkPluginID,
    useChainId,
    useDefaultChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { WalletDescription, WalletDescriptionProps } from './WalletDescription'

const useStyles = makeStyles()((theme) => ({
    icon: {
        fontSize: 24,
        width: 24,
        height: 24,
    },
}))

interface WalletMenuItemProps {
    onSelect?: (value: WalletDescriptionProps, chainId: Web3Helper.ChainIdAll, pluginId: NetworkPluginID) => void
    address: string
    selected?: boolean
    verified?: boolean
    onChangeWallet?: () => void
    platform?: NextIDPlatform
}

export const WalletMenuItem = memo<WalletMenuItemProps>(
    ({ address, selected, onChangeWallet, platform, onSelect, verified }) => {
        const { classes } = useStyles()
        const { t } = useI18N()

        const pluginId = useCurrentWeb3NetworkPluginID(resolveNextIdPlatformPluginId(platform))
        const currentChainId = useChainId()
        const defaultChainId = useDefaultChainId(pluginId)
        const chainId = platform ? defaultChainId : currentChainId

        const name = useWalletName(address, pluginId, !!platform)

        const { Others } = useWeb3State(pluginId)

        const providerDescriptor = useProviderDescriptor()
        const networkDescriptor = useNetworkDescriptor(pluginId, chainId)
        const formattedAddress = Others?.formatAddress(address, 4)
        const addressLink = Others?.explorerResolver.addressLink?.(chainId, address)

        const descriptionProps = {
            name,
            providerIcon: !platform ? providerDescriptor?.icon : undefined,
            networkIcon: networkDescriptor?.icon,
            iconFilterColor: !platform ? providerDescriptor?.iconFilterColor : undefined,
            formattedAddress,
            addressLink,
            address,
            verified,
        }

        return (
            <MenuItem value={address} onClick={() => onSelect?.(descriptionProps, chainId, pluginId)}>
                <ListItemIcon>
                    {selected ? (
                        <Checked
                            className={classes.icon}
                            style={{ filter: 'drop-shadow(0px 0px 6px rgba(28, 104, 243, 0.6))' }}
                        />
                    ) : (
                        <Unchecked className={classes.icon} />
                    )}
                </ListItemIcon>
                <WalletDescription {...descriptionProps} />
                {onChangeWallet ? (
                    <Button size="medium" variant="roundedContained" onClick={onChangeWallet} sx={{ marginLeft: 4 }}>
                        {t('wallet_status_button_change')}
                    </Button>
                ) : null}
            </MenuItem>
        )
    },
)
