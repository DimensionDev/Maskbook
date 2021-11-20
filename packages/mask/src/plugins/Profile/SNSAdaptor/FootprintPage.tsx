import FootprintCard from './components/FootprintCard'
import type { GeneralAssetWithTags } from './common/types'
import config from './common/config'

interface FootprintPageProps {
    listedFootprint: GeneralAssetWithTags[]
    username: string
    address: string
}

export function FootprintPage(props: FootprintPageProps) {
    const { listedFootprint, username, address } = props

    const toSingleFootprint = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlefootprint/${platform}/${identity}/${id}/${type}`)
    }

    return (
        <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
            {listedFootprint.map((asset, index) => (
                <FootprintCard
                    key={index}
                    imageUrl={asset.info.image_preview_url || config.undefinedImageAlt}
                    startDate={asset.info.start_date}
                    endDate={asset.info.end_date}
                    city={asset.info.country}
                    country={asset.info.city}
                    username={username}
                    activity={asset.info.title || ''}
                    clickEvent={() => {
                        toSingleFootprint(asset.platform, asset.identity, asset.id, asset.type)
                    }}
                />
            ))}
        </section>
    )
}
