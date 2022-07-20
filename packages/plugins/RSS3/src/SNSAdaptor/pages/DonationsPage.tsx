import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { List, ListItem } from '@mui/material'
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

    if (loading || !donations.length) {
        return <StatusBox loading={loading} empty={!donations.length} />
    }
    return (
        <List className={classes.list}>
            {donations.map((donation) => (
                <ListItem key={donation.id} className={classes.listItem}>
                    <DonationCard className={classes.donationCard} donation={donation} address={address} />
                </ListItem>
            ))}
        </List>
    )
}
