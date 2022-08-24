import { Icons } from '@masknet/icons'
import { CollectionDetailCard, useWeb3ProfileHiddenSetting } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { differenceWith } from 'lodash-unified'
import { useI18N } from '../../locales'
import { DonationCard, StatusBox } from '../components'
import { useDonations } from '../hooks'

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
    socialAddress?: SocialAddress<NetworkPluginID>
    userId?: string
    publicKey?: string
}

export function DonationPage({ socialAddress, publicKey, userId }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: allDonations = EMPTY_LIST, loading } = useDonations(
        formatEthereumAddress(socialAddress?.address ?? ZERO_ADDRESS),
    )

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSetting(userId, publicKey, {
        address: socialAddress?.address,
        hiddenAddressesKey: 'donations',
        collectionKey: CollectionType.Donations,
    })

    const donations = useMemo(() => {
        if (!hiddenList.length) return allDonations
        return differenceWith(allDonations, hiddenList, (donation, id) => donation.id === id)
    }, [hiddenList, allDonations])

    const [selectedDonation, setSelectedDonation] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !donations.length) {
        return <StatusBox loading={loading} description={t.no_Donation_found()} empty={!donations.length} />
    }

    if (isHiddenAddress || !socialAddress) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_data({ collection: CollectionType.Donations })}
                </Typography>
            </Box>
        )
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
