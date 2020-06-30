import React from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectProps,
    FormControlProps,
    DialogProps,
} from '@material-ui/core'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import type { useSelectWallet } from './useWallet'
import type { WalletDetails } from '../../extension/background-script/PluginService'
interface WalletSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    wallets: WalletDetails[] | undefined
    className?: string
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function WalletSelect({ useSelectWalletHooks, wallets, ...p }: WalletSelectProps) {
    const { selectedWalletAddress, setSelectedWalletAddress } = useSelectWalletHooks
    const { SelectProps, className, FormControlProps } = p
    return (
        <FormControl variant="filled" {...FormControlProps} className={className}>
            <InputLabel>Wallet</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => setSelectedWalletAddress(e.target.value as string)}
                MenuProps={{ container: p.DialogProps?.container ?? PortalShadowRoot }}
                disabled={!wallets}
                value={selectedWalletAddress || ''}>
                {!wallets
                    ? null
                    : wallets.map((x) => (
                          <MenuItem key={x.walletAddress} value={x.walletAddress}>
                              {x.walletName} ({x.walletAddress})
                          </MenuItem>
                      ))}
            </Select>
        </FormControl>
    )
}
