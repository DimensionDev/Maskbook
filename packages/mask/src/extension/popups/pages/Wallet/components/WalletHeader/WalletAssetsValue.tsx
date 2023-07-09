import { Skeleton, Typography, type TypographyProps } from '@mui/material'
import { memo, useMemo } from 'react'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { sum } from 'lodash-es'
import { formatCurrency } from '@masknet/web3-shared-base'

interface WalletAssetsValueProps extends TypographyProps {
    account?: string
    skeletonWidth?: string | number
    skeletonHeight?: string | number
}

export const WalletAssetsValue = memo(function WalletAssetsValue({
    skeletonWidth,
    skeletonHeight,
    account,
    ...props
}: WalletAssetsValueProps) {
    const { assets, assetsLoading } = useContainer(WalletContext)

    const value = useMemo(() => {
        return sum(assets.map((x) => (x.value?.usd ? Number.parseFloat(x.value.usd) : 0)))
    }, [assets])

    if (assetsLoading) {
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

    return <Typography {...props}>{formatCurrency(value, 'USD', { onlyRemainTwoDecimal: true })}</Typography>
})
