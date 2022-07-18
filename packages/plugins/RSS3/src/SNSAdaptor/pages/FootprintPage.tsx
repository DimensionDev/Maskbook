import { makeStyles } from '@masknet/theme'
import urlcat from 'urlcat'
import type { GeneralAsset, GeneralAssetWithTags } from '../../types'
import { FootprintCard, StatusBox } from '../components'
import { useRss3Profile } from '../hooks'

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
    footprints?: GeneralAsset[]
    loading?: boolean
    addressLabel: string
    address?: string
}

export function FootprintPage({ footprints = [], address, loading, addressLabel }: FootprintPageProps) {
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(address || '')
    const username = profile?.name

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} empty={!footprints.length} />
    }

    return (
        <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
            {footprints.map((footprint) => (
                <FootprintCard key={footprint.id} username={username ?? ''} footprint={footprint} />
            ))}
        </section>
    )
}
