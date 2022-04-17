import { memo, useCallback, useState } from 'react'
import { DisconnectWalletDialog } from '../components/DisconnectDialog'
import { WalletCom } from '../components/WalletCom'
import type { WalletProof } from '../TipsEntranceDialog'

interface WalletsPageProp {
    wallets: WalletProof[]
    releaseLoading: boolean
    onRelease: (wallet?: WalletProof) => Promise<void>
    personaName: string | undefined
}

const WalletsPage = memo(({ wallets, releaseLoading, onRelease, personaName }: WalletsPageProp) => {
    const [open, setOpen] = useState(false)
    const [walletToDel, setWalletToDel] = useState<WalletProof>()
    const deleteWallet = useCallback((wallet: WalletProof) => {
        setWalletToDel(wallet)
        setOpen(true)
    }, [])

    return (
        <>
            {wallets.map((x, idx) => {
                return (
                    <WalletCom
                        onDelete={() => deleteWallet(x)}
                        canDelete
                        key={idx}
                        index={idx}
                        address={x.identity}
                        isDefault={!!x.isDefault}
                    />
                )
            })}
            <DisconnectWalletDialog
                personaName={personaName}
                confirmLoading={releaseLoading}
                onConfirmDisconnect={async () => onRelease(walletToDel)}
                address={walletToDel?.identity}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    )
})

export default WalletsPage
