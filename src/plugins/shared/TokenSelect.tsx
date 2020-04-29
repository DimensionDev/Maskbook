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
import BigNumber from 'bignumber.js'
import type { useSelectWallet } from './useWallet'
interface TokenSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    className?: string
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function TokenSelect({ useSelectWalletHooks, ...p }: TokenSelectProps) {
    const { SelectProps, className, FormControlProps } = p
    const { setSelectedTokenType, availableTokens, selectedTokenType } = useSelectWalletHooks
    return (
        <FormControl variant="filled" {...FormControlProps} className={className}>
            <InputLabel>Token</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => {
                    const v = e.target.value as string
                    if (v === 'eth') setSelectedTokenType({ type: 'eth' })
                    else setSelectedTokenType({ type: 'erc20', address: v })
                }}
                MenuProps={{ container: p.DialogProps?.container ?? PortalShadowRoot }}
                value={selectedTokenType.type === 'eth' ? 'eth' : selectedTokenType.address}>
                <MenuItem key="eth" value="eth">
                    ETH
                </MenuItem>
                {availableTokens.map((x) => (
                    <MenuItem disabled={!BigNumber.isBigNumber(x.amount)} key={x.address} value={x.address}>
                        {x.name} ({x.symbol})
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
