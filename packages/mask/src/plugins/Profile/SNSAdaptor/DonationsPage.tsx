import DonationCard from './components/DonationCard'
import type { GeneralAssetWithTags } from './common/types'
import config from './common/config'

interface DonationPageProps {
    listedDonation: GeneralAssetWithTags[]
    address: string
}
export function DonationPage(props: DonationPageProps) {
    const { listedDonation, address } = props

    const toSingleDonation = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlegitcoin/${platform}/${identity}/${id}/${type}`)
    }

    return (
        <section className="grid grid-cols-1 gap-4 py-4">
            {listedDonation.map((asset, index) => (
                <DonationCard
                    key={index}
                    imageUrl={asset.info.image_preview_url || config.undefinedImageAlt}
                    name={asset.info.title || 'Inactive Project'}
                    contribCount={asset.info.total_contribs || 0}
                    contribDetails={asset.info.token_contribs || []}
                    clickEvent={() => {
                        toSingleDonation(asset.platform, asset.identity, asset.id, asset.type)
                    }}
                />
            ))}
        </section>
    )
}
