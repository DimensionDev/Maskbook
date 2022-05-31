import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { AddressName } from '@masknet/web3-shared-evm/types'
import { Link, List, ListItem, Typography } from '@mui/material'
import urlcat from 'urlcat'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { useI18N } from '../../locales'
import { GeneralAssetWithTags } from '../../types'
import { DonationCard, StatusBox } from '../components'
import { TabHeader } from '../components/TabHeader'
import { useDonations } from '../hooks'

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
        gridTemplateColumns: 'repeat(2, 1fr)',
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
    loading?: boolean
    addressLabel: string
    address: string
    addressName: AddressName
}

export function DonationPage({ addressLabel, address, addressName }: DonationPageProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: donations = EMPTY_LIST, loading } = useDonations(address)

    const summary = !loading ? (
        <Typography color="textPrimary" component="span">
            {t.total_grants({
                count: donations.length.toString(),
            })}
        </Typography>
    ) : null

    if (loading || !donations.length) {
        return <StatusBox loading={loading} empty={!donations.length} />
    }
    return (
        <>
            <TabHeader addressLabel={addressLabel} addressName={addressName}>
                {summary}
            </TabHeader>
            <List className={classes.list}>
                {donations.map((donation) => (
                    <ListItem key={donation.id} className={classes.listItem}>
                        <Link
                            className={classes.link}
                            href={getDonationLink(addressLabel, donation)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <DonationCard
                                className={classes.donationCard}
                                imageUrl={donation.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                                name={donation.info.title || t.inactive_project()}
                                contribCount={donation.info.total_contribs || 0}
                                contribDetails={donation.info.token_contribs || []}
                            />
                        </Link>
                    </ListItem>
                ))}
            </List>
        </>
    )
}
