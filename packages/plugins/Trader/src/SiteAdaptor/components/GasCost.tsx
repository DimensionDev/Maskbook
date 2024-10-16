import { useNativeToken } from '@masknet/web3-hooks-base'
import { type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Typography, type TypographyProps } from '@mui/material'
import { type BigNumber } from 'bignumber.js'
import { useGasCost } from '../trader/hooks/useGasCost.js'

interface Props extends TypographyProps {
    chainId: ChainId
    gasPrice: BigNumber.Value | undefined
    gasLimit: BigNumber.Value | undefined
}
export function GasCost({ chainId, gasPrice, gasLimit, ...rest }: Props) {
    const { data: nativeToken } = useNativeToken()
    const { gasFee, gasCost } = useGasCost(gasPrice || '0', gasLimit || '1')
    const tokenCost = `${formatWeiToEther(gasFee)} ${nativeToken?.symbol ?? '--'}`
    return (
        <Typography {...rest}>
            {tokenCost}
            {gasCost ? ` ≈ $${gasCost}` : ''}
        </Typography>
    )
}
