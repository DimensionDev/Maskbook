import { AddressViewer } from '@masknet/shared'
import { AddressName, AddressNameType } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { DonationPage, FootprintPage } from '../pages'

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
}

export interface TabCardProps {
    type: TabCardType
    addressNames: AddressName[]
}

export function TabCard({ type, addressNames }: TabCardProps) {
    const addressNameRSS3 = addressNames.find((x) => x.type === AddressNameType.RSS3)
    if (!addressNameRSS3) return
    return (
        <>
            <link rel="stylesheet" href={new URL('../styles/tailwind.css', import.meta.url).toString()} />
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <div />
                <AddressViewer addressName={addressNameRSS3} />
            </Box>
            {type === TabCardType.Donation ? (
                <DonationPage address={addressNameRSS3.resolvedAddress} />
            ) : (
                <FootprintPage address={addressNameRSS3.resolvedAddress} />
            )}
        </>
    )
}
