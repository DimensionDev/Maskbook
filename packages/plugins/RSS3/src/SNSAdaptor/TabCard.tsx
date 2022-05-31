import { IdentityAddress, IdentityAddressType } from '@masknet/web3-shared-base'
import { useI18N } from '../locales'
import { DonationPage, FootprintPage } from './pages'
import { ProfilePage } from './pages/ProfilePage'

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
    Profile = 3,
}

export interface TabCardProps {
    type: TabCardType
    addressNames: IdentityAddress[]
}

export function TabCard({ type, addressNames }: TabCardProps) {
    const t = useI18N()
    const addressName = addressNames.find((x) => x.type === IdentityAddressType.RSS3)
    const userAddress = addressName?.address || ''

    if (!addressName) return null

    return (
        <>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            {type === TabCardType.Donation && (
                <DonationPage addressName={addressName} address={userAddress} addressLabel={addressName.label} />
            )}
            {type === TabCardType.Footprint && (
                <FootprintPage addressName={addressName} address={userAddress} addressLabel={addressName.label} />
            )}
            {type === TabCardType.Profile && (
                <ProfilePage addressName={addressName} address={userAddress} addressLabel={addressName.label} />
            )}
        </>
    )
}
