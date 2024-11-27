import { useMemo, useState, useEffect, useCallback } from 'react'
import { BigNumber } from 'bignumber.js'
import { Tune } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { GasSettingModal, TokenPrice } from '@masknet/shared'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import { GasOptionType, multipliedBy } from '@masknet/web3-shared-base'
import { EVMChainResolver } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleToken, useGasPrice } from '@masknet/web3-hooks-base'

export interface GasSettingBarProps {
    gasLimit: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    onChange?: (tx: NonPayableTx) => void
}

export function GasSettingBar(props: GasSettingBarProps) {
    const { gasLimit, gasPrice, maxFee, priorityFee, onChange } = props

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: nativeTokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const [gasPriceDefault = '0'] = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [gasOption, setGasOptionType] = useState<GasOptionType>(GasOptionType.NORMAL)

    const onOpenGasSettingDialog = useCallback(() => {
        GasSettingModal.open(
            EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') ?
                {
                    gasLimit,
                    maxFee,
                    priorityFee,
                    gasOption,
                }
            :   {
                    gasLimit,
                    gasPrice,
                    gasOption,
                },
        )
    }, [chainId, gasLimit, gasPrice, maxFee, priorityFee, gasOption])

    // set initial options
    useEffect(() => {
        const off = GasSettingModal.emitter.on('close', (evt) => {
            if (evt?.gasOption) setGasOptionType(evt.gasOption)
            onChange?.(
                (EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') ?
                    {
                        gas: evt?.gasLimit,
                        maxFeePerGas: evt?.maxFee,
                        maxPriorityFeePerGas: evt?.priorityFee,
                    }
                :   {
                        gas: evt?.gasLimit,
                        gasPrice: evt?.gasPrice,
                    }) as NonPayableTx,
            )
        })
        return () => {
            off()
        }
    }, [])

    const gasFee = useMemo(() => {
        return multipliedBy(
            gasLimit,
            EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') && maxFee ?
                new BigNumber(maxFee)
            :   (gasPrice ?? gasPriceDefault),
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
