import { useMemo, useState, useEffect, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { chainResolver, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Tune } from '@mui/icons-material'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { Box, IconButton, Typography } from '@mui/material'
import { WalletMessages } from '../../messages'
import { TokenPrice } from '../../../../components/shared/TokenPrice'
import { GasOptionType, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useFungibleToken, useGasPrice } from '@masknet/plugin-infra/web3'

export interface GasSettingBarProps {
    gasLimit: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    onChange: (tx: NonPayableTx) => void
}

export function GasSettingBar(props: GasSettingBarProps) {
    const { gasLimit, gasPrice, maxFee, priorityFee, onChange } = props

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: nativeTokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const { value: gasPriceDefault = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)

    const [gasOption, setGasOptionType] = useState<GasOptionType>(GasOptionType.NORMAL)
    const { setDialog: setGasSettingDialog } = useRemoteControlledDialog(WalletMessages.events.gasSettingDialogUpdated)
    const onOpenGasSettingDialog = useCallback(() => {
        setGasSettingDialog(
            chainResolver.isSupport(chainId, 'EIP1559')
                ? {
                      open: true,
                      gasLimit,
                      maxFee,
                      priorityFee,
                      gasOption,
                  }
                : {
                      open: true,
                      gasLimit,
                      gasPrice,
                      gasOption,
                  },
        )
    }, [chainId, gasLimit, gasPrice, maxFee, priorityFee, gasOption])

    // set initial options
    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.open) return
            if (evt.gasOption) setGasOptionType(evt.gasOption)
            onChange(
                (chainResolver.isSupport(chainId, 'EIP1559')
                    ? {
                          gas: evt.gasLimit,
                          maxFeePerGas: evt.maxFee,
                          maxPriorityFeePerGas: evt.priorityFee,
                      }
                    : {
                          gas: evt.gasLimit,
                          gasPrice: evt.gasPrice,
                      }) as NonPayableTx,
            )
        })
    }, [])

    const gasFee = useMemo(() => {
        return multipliedBy(
            gasLimit,
            chainResolver.isSupport(chainId, 'EIP1559') && maxFee ? new BigNumber(maxFee) : gasPrice ?? gasPriceDefault,
        )
    }, [chainId, gasLimit, gasPrice, maxFee, gasPriceDefault])

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <Typography fontSize="14px" sx={{ marginRight: 1 }}>
                <span>
                    {formatWeiToEther(gasFee).toFixed(6)} {nativeTokenDetailed?.symbol ?? ''} &asymp;
                </span>
                <TokenPrice chainId={chainId} amount={formatWeiToEther(gasFee)} />
            </Typography>
            <IconButton size="small" onClick={onOpenGasSettingDialog}>
                <Tune fontSize="small" color="inherit" />
            </IconButton>
        </Box>
    )
}
