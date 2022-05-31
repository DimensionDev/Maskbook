import { AddressName } from '@masknet/web3-shared-evm'
import { useI18N } from '../locales'
import { ProfilePage } from './pages/ProfilePage'

export interface TabCardProps {
    addressNames: AddressName[]
}

export function TabCard({ addressNames }: TabCardProps) {
    const t = useI18N()
    const addressName = addressNames[0]
    const userAddress = addressName?.resolvedAddress || ''

    if (!addressName) return null

    return (
        <>
            <ProfilePage address={userAddress} />
        </>
    )
}
