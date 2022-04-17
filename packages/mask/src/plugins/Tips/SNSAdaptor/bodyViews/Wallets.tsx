import type { BindingProof } from '@masknet/shared-base'
import { memo } from 'react'
import { WalletCom } from '../components/WalletCom'

interface WalletsPageProp {
    wallets: BindingProof[]
}

const WalletsPage = memo(({ wallets }: WalletsPageProp) => {
    return (
        <>
            {wallets.map((x, idx) => {
                return <WalletCom canDelete key={idx} index={idx} address={x.identity} isDefault />
            })}
        </>
    )
})

export default WalletsPage
