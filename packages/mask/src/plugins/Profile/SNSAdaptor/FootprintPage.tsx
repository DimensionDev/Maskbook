import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import type { AddressName } from '@masknet/web3-shared-evm'
import type { GeneralAsset, GeneralAssetWithTags } from '../types'
import { RSS3_DEFAULT_IMAGE } from '../constants'
import { FootprintCard } from './components'
import { useRss3Profile } from './hooks'

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
    addressName?: AddressName
    footprints?: GeneralAsset[]
}

export function FootprintPage(props: FootprintPageProps) {
    const { addressName, footprints = [] } = props
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(addressName?.resolvedAddress ?? '')
    const username = profile?.name

    if (!addressName) return null

    return (
        <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
            {footprints.map((footprint) => (
                <Link
                    className={classes.link}
                    href={getFootprintLink(addressName.label, footprint)}
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
    )
}
