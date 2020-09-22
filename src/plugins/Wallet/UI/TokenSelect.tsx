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
import BigNumber from 'bignumber.js'
import type { useSelectWallet } from '../hooks/useWallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumTokenType } from '../../../web3/types'
import { isETH } from '../../../web3/helpers'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'

interface TokenSelectProps {
    useSelectWalletHooks: ReturnType<typeof useSelectWallet>
    className?: string
    SelectProps?: SelectProps
    FormControlProps?: FormControlProps
    DialogProps?: Partial<DialogProps>
}
export function TokenSelect({ useSelectWalletHooks, ...p }: TokenSelectProps) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const { t } = useI18N()
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
            <InputLabel>{t('wallet_token')}</InputLabel>
            <Select
                {...SelectProps}
                onChange={(e) => {
                    const address = e.target.value as string
                    setSelectedTokenType(isETH(address) ? EthereumTokenType.Ether : EthereumTokenType.ERC20)
                    setSelectedTokenAddress(address)
                }}
                MenuProps={{ container: p.DialogProps?.container ?? PortalShadowRoot }}
                value={selectedTokenType === EthereumTokenType.Ether ? ETH_ADDRESS : selectedTokenAddress}>
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
