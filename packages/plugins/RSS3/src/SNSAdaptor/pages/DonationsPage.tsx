import { useMemo, useState } from 'react'
import { differenceWith } from 'lodash-unified'
import { Icons } from '@masknet/icons'
import { CollectionDetailCard, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { EMPTY_LIST, joinKeys } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import type { SocialAccount } from '@masknet/web3-shared-base'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, Typography } from '@mui/material'
import { useI18N } from '../../locales/index.js'
import { DonationCard, StatusBox } from '../components/index.js'
import { useDonations } from '../hooks/index.js'

const useStyles = makeStyles()((theme) => ({
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
}))

export interface DonationPageProps {
    socialAccount?: SocialAccount
    userId?: string
    publicKey?: string
}

export function DonationPage({ socialAccount, publicKey, userId }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: allDonations = EMPTY_LIST, loading } = useDonations(socialAccount?.address ?? ZERO_ADDRESS)

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(userId, publicKey, {
        address: socialAccount?.address,
        hiddenAddressesKey: 'donations',
        collectionKey: CollectionType.Donations,
    })

    const donations = useMemo(() => {
        if (!hiddenList.length) return allDonations
        return differenceWith(
            allDonations,
            hiddenList,
            (donation, id) => joinKeys(donation.hash, donation.actions[0].index) === id,
        )
    }, [hiddenList, allDonations])

    const [selectedDonation, setSelectedDonation] = useState<RSS3BaseAPI.Donation>()

    if (loading || !donations.length) {
        return (
            <Box p={2}>
                <StatusBox loading={loading} description={t.no_Donation_found()} empty={!donations.length} />
            </Box>
        )
    }

    if (isHiddenAddress || !socialAccount) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_data({ collection: CollectionType.Donations })}
                </Typography>
            </Box>
        )
    }
    const action = selectedDonation ? selectedDonation.actions[0] : null
    return (
        <Box p={2}>
            <List className={classes.list}>
                {donations.map((donation) => (
                    <ListItem key={donation.actions[0].index.toString()} className={classes.listItem}>
                        <DonationCard
                            onSelect={setSelectedDonation}
                            className={classes.donationCard}
                            donation={donation}
                            socialAccount={socialAccount}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedDonation && action ? (
                <CollectionDetailCard
                    open
                    onClose={() => setSelectedDonation(undefined)}
                    img={action.metadata?.logo}
                    title={action.metadata?.title}
                    referenceURL={action.related_urls?.[0]}
                    description={action.metadata?.description}
                    type={CollectionType.Donations}
                    time={selectedDonation.timestamp}
                    tokenSymbol={action.metadata?.token.symbol}
                    tokenAmount={action.metadata?.token.value_display}
                    hash={selectedDonation.hash}
                />
            ) : null}
        </Box>
    )
}
