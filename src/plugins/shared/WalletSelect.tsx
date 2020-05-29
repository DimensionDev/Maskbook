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
import type { useSelectWallet, useWalletDataSource } from './useWallet'
interface WalletSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    wallets: ReturnType<typeof useWalletDataSource>[0]
    className?: string
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function WalletSelect({ useSelectWalletHooks, wallets, ...p }: WalletSelectProps) {
    const { selectedWalletAddress, setSelectedWallet } = useSelectWalletHooks
    const { SelectProps, className, FormControlProps } = p
    return (
        <FormControl variant="filled" {...FormControlProps} className={className}>
            <InputLabel>Wallet</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => setSelectedWallet(e.target.value as string)}
                MenuProps={{ container: p.DialogProps?.container ?? PortalShadowRoot }}
                disabled={wallets === 'loading'}
                value={selectedWalletAddress || ''}>
                {wallets === 'loading'
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
