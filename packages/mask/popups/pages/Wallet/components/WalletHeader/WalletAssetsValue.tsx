import { FormattedCurrency, ProgressiveText, type ProgressiveTextProps } from '@masknet/shared'
import { formatCurrency } from '@masknet/web3-shared-base'
import { sum } from 'lodash-es'
import { memo, useMemo } from 'react'
import { useWalletAssets } from '../../hooks/index.js'

interface WalletAssetsValueProps extends Omit<ProgressiveTextProps, 'loading'> {
    account?: string
}

export const WalletAssetsValue = memo(function WalletAssetsValue({ account, ...props }: WalletAssetsValueProps) {
    const [assets, { isPending }] = useWalletAssets()

    const value = useMemo(() => {
        return sum(assets.map((x) => (x.value?.usd ? Number.parseFloat(x.value.usd) : 0)))
    }, [assets])

    return (
        <ProgressiveText {...props} loading={isPending}>
            <FormattedCurrency
                value={value}
                formatter={formatCurrency}
                options={{ onlyRemainTwoOrZeroDecimal: true }}
            />
        </ProgressiveText>
    )
})
