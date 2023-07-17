import { NetworkPluginID } from '@masknet/shared-base'
import { useBalance, useNativeToken } from '@masknet/web3-hooks-base'
import { Skeleton, Typography, type TypographyProps } from '@mui/material'
import { memo } from 'react'
import { formatBalance } from '../../../../utils/index.js'

interface WalletBalanceProps extends TypographyProps {
    account?: string
    skeletonWidth?: string | number
    skeletonHeight?: string | number
}

export const WalletBalance = memo(function WalletBalance({
    skeletonWidth,
    skeletonHeight,
    account,
    ...props
}: WalletBalanceProps) {
    const { data: balance, isLoading: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM, { account })
    const { data: nativeToken, isLoading: isLoadingToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)

    if (!nativeToken) return null
    if (loadingBalance || isLoadingToken) {
        return (
            <Typography {...props}>
                <Skeleton
                    animation="wave"
                    variant="text"
                    height={skeletonHeight ?? '1.5em'}
                    width={skeletonWidth ?? '100%'}
                />
            </Typography>
        )
    }

    return <Typography {...props}>{`${formatBalance(balance, nativeToken.decimals)} ${nativeToken.symbol}`}</Typography>
})
