import { NetworkPluginID } from '@masknet/shared-base'
import { useBalance, useNativeToken } from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { Skeleton, Typography, type TypographyProps } from '@mui/material'
import { memo } from 'react'

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
    const { value: balance, loading } = useBalance(NetworkPluginID.PLUGIN_EVM, { account })
    const { data: nativeToken, isLoading } = useNativeToken(NetworkPluginID.PLUGIN_EVM)

    if (loading || isLoading) {
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
    if (!nativeToken) return null

    const uiBalance = `${formatBalance(balance, nativeToken.decimals)} ${nativeToken.symbol}`
    return <Typography {...props}>{uiBalance}</Typography>
})
