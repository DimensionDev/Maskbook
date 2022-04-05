import { memo } from 'react'
import { WalletCom } from '../components/WalletCom'

const WalletsPage = memo(() => {
    const boundWalletsMap = [
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: false },
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: false },
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: false },
    ]
    return (
        <>
            {boundWalletsMap.map((x, idx) => {
                return <WalletCom canDelete key={idx} name={x.name} address={x.address} isDefault={x.isDefault} />
            })}
        </>
    )
})

export default WalletsPage
