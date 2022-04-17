import { memo } from 'react'
import { WalletCom } from '../components/WalletCom'
import type { WalletProof } from '../TipsEnteranceDialog'

interface WalletsPageProp {
    wallets: WalletProof[]
}

const WalletsPage = memo(({ wallets }: WalletsPageProp) => {
    return (
        <>
            {wallets.map((x, idx) => {
                return <WalletCom canDelete key={idx} index={idx} address={x.identity} isDefault={!!x.isDefault} />
            })}
        </>
    )
})

export default WalletsPage
