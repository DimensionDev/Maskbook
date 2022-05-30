import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import urlcat from 'urlcat'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { GeneralAssetWithTags } from '../../types'
import { FootprintCard, StatusBox } from '../components'
import { useFootprints, useRss3Profile } from '../hooks'
import { TabHeader } from '../components/TabHeader'
import { AddressName } from '@masknet/web3-shared-evm/types'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    address: {
        color: theme.palette.primary.main,
    },
    link: {
        '&:hover': {
            textDecoration: 'none',
        },
    },
}))

const getFootprintLink = (label: string, footprint: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = footprint
    return urlcat(`https://${label}.bio/singlefootprint/:platform/:identity/:id/:type`, {
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
    })
}

export interface FootprintPageProps {
    loading?: boolean
    addressLabel: string
    address: string
    addressName: AddressName
}

export function FootprintPage({ address, addressLabel, addressName }: FootprintPageProps) {
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(address || '')
    const username = profile?.name
    const { value: footprints = EMPTY_LIST, loading } = useFootprints(address)

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} empty={!footprints.length} />
    }

    return (
        <>
            <TabHeader addressLabel={addressLabel} addressName={addressName} />

            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
                {footprints.map((footprint) => (
                    <Link
                        className={classes.link}
                        href={getFootprintLink(addressLabel, footprint)}
                        key={footprint.id}
                        target="_blank"
                        rel="noopener noreferrer">
                        <FootprintCard
                            imageUrl={footprint.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                            startDate={footprint.info.start_date}
                            endDate={footprint.info.end_date}
                            city={footprint.info.country}
                            country={footprint.info.city}
                            username={username ?? ''}
                            activity={footprint.info.title || ''}
                        />
                    </Link>
                ))}
            </section>
        </>
    )
}
