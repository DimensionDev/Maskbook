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
import { EthereumTokenType } from '../Wallet/database/types'
import { ETH_ADDRESS } from '../Wallet/token'
interface TokenSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    className?: string
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function TokenSelect({ useSelectWalletHooks, ...p }: TokenSelectProps) {
    const { SelectProps, className, FormControlProps } = p
    const {
        availableTokens,
        selectedTokenType,
        selectedTokenAddress,
        setSelectedTokenType,
        setSelectedTokenAddress,
    } = useSelectWalletHooks
    return (
        <FormControl variant="filled" {...FormControlProps} className={className}>
            <InputLabel>Token</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => {
                    const address = e.target.value as string
                    setSelectedTokenType(address === ETH_ADDRESS ? EthereumTokenType.ETH : EthereumTokenType.ERC20)
                    setSelectedTokenAddress(address)
                }}
                MenuProps={{ container: p.DialogProps?.container ?? PortalShadowRoot }}
                value={selectedTokenType === EthereumTokenType.ETH ? ETH_ADDRESS : selectedTokenAddress}>
                <MenuItem key={ETH_ADDRESS} value={ETH_ADDRESS}>
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
