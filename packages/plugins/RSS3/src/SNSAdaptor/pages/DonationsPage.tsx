import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, List, ListItem } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../../locales'
import { DonationCard, StatusBox } from '../components'
import { useAvailableCollections, useDonations } from '../hooks'
import { useKV } from '../hooks/useKV'

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(6),
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gridGap: theme.spacing(2),
    },
    listItem: {
        overflow: 'auto',
        padding: 0,
    },
    donationCard: {
        width: '100%',
        overflow: 'auto',
    },
    address: {
        color: theme.palette.primary.main,
    },
    link: {
        width: '100%',
        '&:hover': {
            textDecoration: 'none',
        },
    },
}))

export interface DonationPageProps {
    socialAddress: SocialAddress<NetworkPluginID>
    publicKey: string
    userId: string
}

export function DonationPage({ socialAddress, publicKey, userId }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: kvValue } = useKV(publicKey)
    const { value: allDonations = EMPTY_LIST, loading } = useDonations(
        formatEthereumAddress(socialAddress?.address ?? ZERO_ADDRESS),
    )
    const donations = useAvailableCollections(
        kvValue?.proofs ?? EMPTY_LIST,
        CollectionType.Donations,
        allDonations,
        userId,
        socialAddress.address,
    )

    const [selectedDonation, setSelectedDonation] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !donations.length) {
        return <StatusBox loading={loading} description={t.no_Donation_found()} empty={!donations.length} />
    }
    return (
        <Box margin="16px 0 0 16px">
            <List className={classes.list}>
                {donations.map((donation) => (
                    <ListItem key={donation.id} className={classes.listItem}>
                        <DonationCard
                            onSelect={() => setSelectedDonation(donation)}
                            className={classes.donationCard}
                            donation={donation}
                            socialAddress={socialAddress}
                        />
                    </ListItem>
                ))}
            </List>
            <CollectionDetailCard
                open={Boolean(selectedDonation)}
                onClose={() => setSelectedDonation(undefined)}
                img={selectedDonation?.imageURL}
                title={selectedDonation?.title}
                referenceURL={selectedDonation?.actions?.[0]?.related_urls?.[0]}
                description={selectedDonation?.description}
                type={CollectionType.Donations}
                time={selectedDonation?.timestamp}
                tokenSymbol={selectedDonation?.tokenSymbol}
                tokenAmount={selectedDonation?.tokenAmount?.toString()}
                hash={selectedDonation?.hash}
            />
        </Box>
    )
}
