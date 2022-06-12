import { AddressViewer } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { Box, Typography } from '@mui/material'
import { useI18N } from '../locales'
import { useDonations, useFootprints } from './hooks'
import { DonationPage, FootprintPage } from './pages'

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
}

export interface TabCardProps {
    type: TabCardType
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

export function TabCard({ type, socialAddressList }: TabCardProps) {
    const t = useI18N()
    const addressName = socialAddressList?.find(
        (x) => x.type === SocialAddressType.RSS3 && x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    )
    const userAddress = addressName?.address || ''
    const { value: donations = EMPTY_LIST, loading: loadingDonations } = useDonations(userAddress)
    const { value: footprints = EMPTY_LIST, loading: loadingFootprints } = useFootprints(userAddress)

    if (!addressName) return null

    const isDonation = type === TabCardType.Donation

    const summary =
        isDonation && !loadingDonations ? (
            <Typography color="textPrimary" component="span">
                {t.total_grants({
                    count: donations.length.toString(),
                })}
            </Typography>
        ) : null

    return (
        <>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>{summary}</div>
                <AddressViewer identityAddress={addressName} />
            </Box>
            {isDonation ? (
                <DonationPage donations={donations} loading={loadingDonations} addressLabel={addressName.label} />
            ) : (
                <FootprintPage
                    address={userAddress}
                    loading={loadingFootprints}
                    footprints={footprints}
                    addressLabel={addressName.label}
                />
            )}
        </>
    )
}
