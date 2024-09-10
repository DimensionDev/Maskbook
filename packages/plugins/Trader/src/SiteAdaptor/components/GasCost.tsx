import { Typography, type TypographyProps } from '@mui/material'
import { type BigNumber } from 'bignumber.js'
import { useGasCost } from '../trader/hooks/useGasCost.js'
import { useSwap } from '../trader/contexts/SwapProvider.js'
import { formatWeiToEther } from '@masknet/web3-shared-evm'

interface Props extends TypographyProps {
    gasPrice: BigNumber.Value | undefined
    gasLimit: BigNumber.Value | undefined
}
export function GasCost({ gasPrice, gasLimit, ...rest }: Props) {
    const { nativeToken } = useSwap()
    const { gasFee, gasCost } = useGasCost(gasPrice || '0', gasLimit || '1')
    const tokenCost = `${formatWeiToEther(gasFee)}${nativeToken?.symbol ?? '--'}`
    return (
        <Typography {...rest}>
            {tokenCost}
            {gasCost ? ` ≈ ${gasCost}` : ''}
        </Typography>
    )
}
