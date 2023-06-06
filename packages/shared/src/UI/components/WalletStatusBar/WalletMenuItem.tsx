import { memo } from 'react'
import { Button, ListItemIcon, MenuItem } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useSharedI18N } from '../../../locales/index.js'
import { resolveNextID_NetworkPluginID } from '@masknet/web3-shared-base'
import type { NetworkPluginID, NextIDPlatform } from '@masknet/shared-base'
import { useWalletName } from './hooks/useWalletName.js'
import {
    useNetworkContext,
    useChainContext,
    useDefaultChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletDescription, type WalletDescriptionProps } from './WalletDescription.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    icon: {
        color: theme.palette.maskColor.line,
    },
}))
interface WalletMenuItemProps {
    onSelect?: (value: WalletDescriptionProps, chainId: Web3Helper.ChainIdAll, pluginID: NetworkPluginID) => void
    address: string
    selected?: boolean
    verified?: boolean
    onChangeWallet?: () => void
    platform?: NextIDPlatform
    expectedChainId?: Web3Helper.ChainIdAll
}

export const WalletMenuItem = memo<WalletMenuItemProps>(
    ({ address, selected, onChangeWallet, platform, onSelect, verified, expectedChainId }) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        const { pluginID } = useNetworkContext(platform ? resolveNextID_NetworkPluginID(platform) : undefined)
        const defaultChainId = useDefaultChainId(pluginID)
        const { chainId } = useChainContext({
            chainId: platform ? defaultChainId : expectedChainId,
        })

        const name = useWalletName(address, pluginID, !!platform)
        const Others = useWeb3Others(pluginID)

        const providerDescriptor = useProviderDescriptor()
        const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
        const formattedAddress = Others.formatAddress(address, 4)
        const addressLink = Others.explorerResolver.addressLink(chainId, address)

        const descriptionProps = {
            name,
            providerIcon: !platform ? providerDescriptor.icon : undefined,
            networkIcon: networkDescriptor?.icon,
            iconFilterColor: !platform ? providerDescriptor.iconFilterColor : undefined,
            formattedAddress,
            addressLink,
            address,
            verified,
        }

        return (
            <MenuItem value={address} onClick={() => onSelect?.(descriptionProps, chainId, pluginID)}>
                {/* TODO: replace to radio */}
                <ListItemIcon>
                    {selected ? (
                        <Icons.RadioButtonChecked
                            size={24}
                            style={{ filter: 'drop-shadow(0px 0px 6px rgba(28, 104, 243, 0.6))' }}
                        />
                    ) : (
                        <Icons.RadioButtonUnChecked size={24} className={classes.icon} />
                    )}
                </ListItemIcon>
                <WalletDescription {...descriptionProps} />
                {onChangeWallet ? (
                    <Button size="medium" variant="roundedContained" onClick={onChangeWallet} sx={{ marginLeft: 4 }}>
                        {t.wallet_status_button_change()}
                    </Button>
                ) : null}
            </MenuItem>
        )
    },
)
