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
import { Box, IconButton, Typography } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { TokenPrice } from '../../../../components/shared/TokenPrice'

export interface GasSettingBarProps {}

export function GasSettingBar(props: GasSettingBarProps) {
    // const { gasLimit } = props

    const { t } = useI18N()
    const chainId = useChainId()

    const [gasLimit, setGasLimit] = useState<string>('0')
    const [maxFee, setMaxFee] = useState<string | null>(null)
    const [priorityFee, setPriorityFee] = useState<string | null>(null)
    const { value: defaultGasPrice = '0' } = useGasPrice()
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const gasPrice = customGasPrice || defaultGasPrice

    const { value: nativeTokenDetailed } = useNativeTokenDetailed()

    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const { setDialog: setGasSettingDialog } = useRemoteControlledDialog(WalletMessages.events.gasSettingDialogUpdated)
    const onOpenGasSettingDialog = useCallback(() => {
        setGasSettingDialog({
            open: true,
            gasLimit,
            gasOption,
        })
    }, [gasLimit, gasOption])

    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.open) return
            if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
            if (evt.gasOption) setGasOption(evt.gasOption)
            if (evt.gasLimit) setGasLimit(evt.gasLimit)
            if (evt.maxFee) setMaxFee(evt.maxFee)
            if (evt.priorityFee) setPriorityFee(evt.priorityFee)
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
