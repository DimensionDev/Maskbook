import { useMemo, useState, useEffect, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    formatWeiToEther,
    GasOption,
    isEIP1559Supported,
    useChainId,
    useGasPrice,
    useNativeTokenDetailed,
} from '@masknet/web3-shared'
import { Tune } from '@mui/icons-material'
import { useRemoteControlledDialog } from '@masknet/shared'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { Box, IconButton, Typography } from '@material-ui/core'
import { WalletMessages } from '../../messages'
import { TokenPrice } from '../../../../components/shared/TokenPrice'

export interface GasSettingBarProps {
    gasLimit: BigNumber.Value
    onChange: (tx: NonPayableTx) => void
}

export function GasSettingBar(props: GasSettingBarProps) {
    const { gasLimit: initialGasLimit, onChange } = props

    const chainId = useChainId()
    const [gasLimit, setGasLimit] = useState(new BigNumber(initialGasLimit).toFixed())
    const [maxFee, setMaxFee] = useState('0')
    const [priorityFee, setPriorityFee] = useState('0')
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const { value: defaultGasPrice = '0' } = useGasPrice()
    const gasPrice = customGasPrice || defaultGasPrice

    const { value: nativeTokenDetailed } = useNativeTokenDetailed()

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
    }, [chainId, gasLimit, gasOption])

    // set initial options
    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.open) return
            if (evt.gasLimit) setGasLimit(evt.gasLimit)
            if (evt.gasOption) setGasOption(evt.gasOption)
            if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
            if (evt.maxFee) setMaxFee(evt.maxFee)
            if (evt.priorityFee) setPriorityFee(evt.priorityFee)

            onChange((
                isEIP1559Supported(chainId) ? {
                    gas: evt.gasLimit,
                    maxFee: evt.maxFee,
                    priorityFee: evt.priorityFee,
                } : {
                    gas: evt.gasLimit,
                    gasPrice: evt.gasPrice,
                }
            ) as NonPayableTx)
        })
    }, [])

    const gasFee = useMemo(() => {
        const price = isEIP1559Supported(chainId) && maxFee ? new BigNumber(maxFee) : gasPrice
        return new BigNumber(gasLimit).multipliedBy(price)
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
