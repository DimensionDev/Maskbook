import { makeStyles } from '@masknet/theme'
import { List, ListItem } from '@mui/material'
import urlcat from 'urlcat'
import { useI18N } from '../../locales'
import type { GeneralAsset, GeneralAssetWithTags } from '../../types'
import { DonationCard, StatusBox } from '../components'

const getDonationLink = (label: string, donation: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = donation
    return urlcat(`https://${label}.bio/singlegitcoin/:platform/:identity/:id/:type`, {
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
    })
}

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
    donations?: GeneralAsset[]
    loading?: boolean
    addressLabel: string
}

export function DonationPage({ donations = [], loading, addressLabel }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()

    if (loading || !donations.length) {
        return <StatusBox loading={loading} empty={!donations.length} />
    }
    return (
        <List className={classes.list}>
            {donations.map((donation) => (
                <ListItem key={donation.id} className={classes.listItem}>
                    <DonationCard className={classes.donationCard} donation={donation} />
                </ListItem>
            ))}
        </List>
    )
}
