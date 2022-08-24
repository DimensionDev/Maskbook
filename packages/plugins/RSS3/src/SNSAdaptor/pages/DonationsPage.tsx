import { Icons } from '@masknet/icons'
import { PluginId } from '@masknet/plugin-infra'
import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useI18N } from '../../locales'
import { DonationCard, StatusBox } from '../components'
import { useAvailableCollections, useDonations } from '../hooks'
import { useKV } from '../hooks/useKV'
import { isSameAddress } from '@masknet/web3-shared-base'

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
    const { value: kvValue } = useKV(publicKey)
    const { value: allDonations = EMPTY_LIST, loading } = useDonations(
        formatEthereumAddress(socialAddress?.address ?? ZERO_ADDRESS),
    )
    const donations = useAvailableCollections(
        kvValue?.proofs ?? EMPTY_LIST,
        allDonations,
        CollectionType.Donations,
        userId,
        socialAddress?.address,
    )

    const isHiddenAddress = useMemo(() => {
        return kvValue?.proofs
            .find((proof) => proof?.platform === NextIDPlatform.Twitter && proof?.identity === userId?.toLowerCase())
            ?.content?.[PluginId.Web3Profile]?.hiddenAddresses?.donations?.some((x) =>
                isSameAddress(x.address, socialAddress?.address),
            )
    }, [userId, socialAddress, kvValue?.proofs])

    const [selectedDonation, setSelectedDonation] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !donations.length) {
        return (
            <Box p={2}>
                <StatusBox loading={loading} description={t.no_Donation_found()} empty={!donations.length} />
            </Box>
        )
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
        <Box p={2}>
            <List className={classes.list}>
                {donations.map((donation) => (
                    <ListItem key={donation.id} className={classes.listItem}>
                        <DonationCard
                            onSelect={setSelectedDonation}
                            className={classes.donationCard}
                            donation={donation}
                            socialAddress={socialAddress}
                        />
                    </ListItem>
                ))}
            </List>
            {selectedDonation ? (
                <CollectionDetailCard
                    open
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
            ) : null}
        </Box>
    )
}
