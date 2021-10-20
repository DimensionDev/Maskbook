import { useMemo, useState, useEffect, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    formatWeiToEther,
    GasOption,
    isEIP1559Supported,
    useChainId,
    useGasPrice,
    useNativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import { Tune } from '@mui/icons-material'
import { useRemoteControlledDialog } from '@masknet/shared'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { Box, IconButton, Typography } from '@mui/material'
import { WalletMessages } from '../../messages'
import { TokenPrice } from '../../../../components/shared/TokenPrice'

export interface GasSettingBarProps {
    gasLimit: string
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    onChange: (tx: NonPayableTx) => void
}

export function GasSettingBar(props: GasSettingBarProps) {
    const { gasLimit, gasPrice, maxFee, priorityFee, onChange } = props

    const chainId = useChainId()
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { value: gasPriceDefault = '0' } = useGasPrice()

    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const { setDialog: setGasSettingDialog } = useRemoteControlledDialog(WalletMessages.events.gasSettingDialogUpdated)
    const onOpenGasSettingDialog = useCallback(() => {
        setGasSettingDialog(
            isEIP1559Supported(chainId)
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
            if (evt.gasOption) setGasOption(evt.gasOption)
            onChange(
                (isEIP1559Supported(chainId)
                    ? {
                          gas: evt.gasLimit,
                          maxFee: evt.maxFee,
                          priorityFee: evt.priorityFee,
                      }
                    : {
                          gas: evt.gasLimit,
                          gasPrice: evt.gasPrice,
                      }) as NonPayableTx,
            )
        })
    }, [])

    const gasFee = useMemo(() => {
        return new BigNumber(gasLimit).multipliedBy(
            isEIP1559Supported(chainId) && maxFee ? new BigNumber(maxFee) : gasPrice ?? gasPriceDefault,
        )
    }, [chainId, gasLimit, gasPrice, maxFee])

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <Typography fontSize="14px" sx={{ marginRight: 1 }}>
                <span>
                    {formatWeiToEther(gasFee).toFixed(6)} {nativeTokenDetailed?.symbol ?? ''} ≈
                </span>
                <TokenPrice chainId={chainId} contractAddress={nativeTokenDetailed?.address ?? ''} amount={gasFee} />
            </Typography>
            <IconButton size="small" onClick={onOpenGasSettingDialog}>
                <Tune fontSize="small" color="inherit" />
            </IconButton>
        </Box>
    )
}
