import { ProgressiveText, type ProgressiveTextProps } from '@masknet/shared'
import { formatCurrency } from '@masknet/web3-shared-base'
import { sum } from 'lodash-es'
import { memo, useMemo } from 'react'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext.js'

interface WalletAssetsValueProps extends Omit<ProgressiveTextProps, 'loading'> {
    account?: string
}

export const WalletAssetsValue = memo(function WalletAssetsValue({ account, ...props }: WalletAssetsValueProps) {
    const { assets, assetsLoading } = useContainer(WalletContext)

    const value = useMemo(() => {
        return sum(assets.map((x) => (x.value?.usd ? Number.parseFloat(x.value.usd) : 0)))
    }, [assets])

    return (
        <ProgressiveText {...props} loading={assetsLoading}>
            {formatCurrency(value, 'USD', { onlyRemainTwoDecimal: true })}
        </ProgressiveText>
    )
})
