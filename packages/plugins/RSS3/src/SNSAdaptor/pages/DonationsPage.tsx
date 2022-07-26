import { CollectionDetailCard } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { Box, List, ListItem } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../../locales'
import { DonationCard, StatusBox } from '../components'

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
    donations?: RSS3BaseAPI.Donation[]
    loading?: boolean
    address: SocialAddress<NetworkPluginID>
}

export function DonationPage({ donations = [], loading, address }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()

    const [selectedDonation, setSelectedDonation] = useState<RSS3BaseAPI.Donation | undefined>()

    if (loading || !donations.length) {
        return <StatusBox loading={loading} collection="Donation" empty={!donations.length} />
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
                            address={address}
                        />
                    </ListItem>
                ))}
            </List>
            <CollectionDetailCard
                open={Boolean(selectedDonation)}
                onClose={() => setSelectedDonation(undefined)}
                img={selectedDonation?.detail?.grant?.logo}
                title={selectedDonation?.detail?.grant?.title}
                referenceUrl={selectedDonation?.detail?.grant?.reference_url}
                description={selectedDonation?.detail?.grant?.description}
                contributions={selectedDonation?.detail?.txs}
            />
        </Box>
    )
}
