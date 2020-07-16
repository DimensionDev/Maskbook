import React, { useEffect } from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectProps,
    FormControlProps,
    DialogProps,
    InputProps,
} from '@material-ui/core'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import type { useSelectWallet } from './useWallet'
import type { WalletDetails } from '../../extension/background-script/PluginService'
import Services from '../../extension/service'
interface WalletSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    wallets: WalletDetails[] | undefined
    className?: string
    InputProps?: InputProps
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function WalletSelect({ useSelectWalletHooks, wallets, ...props }: WalletSelectProps) {
    const { selectedWalletAddress, setSelectedWalletAddress } = useSelectWalletHooks
    const { SelectProps, className, FormControlProps } = props

    // tracking wallet balance
    useEffect(() => {
        if (!selectedWalletAddress) return
        Services.Plugin.invokePlugin('maskbook.wallet', 'watchWalletBalances', selectedWalletAddress)
        Services.Plugin.invokePlugin('maskbook.wallet', 'updateWalletBalances', [selectedWalletAddress])
    }, [selectedWalletAddress])

    return (
        <FormControl variant="filled" {...FormControlProps} className={className}>
            <InputLabel>Wallet</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => setSelectedWalletAddress(e.target.value as string)}
                disabled={!wallets}
                value={selectedWalletAddress || ''}
                MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}>
                {!wallets
                    ? null
                    : wallets.map((x) => (
                          <MenuItem key={x.address} value={x.address}>
                              {x.name} ({x.address})
                          </MenuItem>
                      ))}
            </Select>
        </FormControl>
    )
}
