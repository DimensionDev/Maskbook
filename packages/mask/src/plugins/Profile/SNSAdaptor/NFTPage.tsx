import NFTItem from './components/NFTItem'
import NFTBadges from './components/NFTBadges'

interface NFTPageProps {
    listedNFT: GeneralAssetWithTags[]
    address: string
}

export function NFTPage(props: NFTPageProps) {
    const { listedNFT, address } = props

    const toSingleFootprint = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlenft/${platform}/${identity}/${id}/${type}`)
    }

    return (
        <section className="grid gap-4 py-4 grid-cols-2 md:grid-cols-3 justify-items-center">
            {listedNFT.map((asset, index) => (
                <div
                    key={index}
                    className="relative cursor-pointer w-full"
                    onClick={() => {
                        toSingleFootprint(asset.platform, asset.identity, asset.id, asset.type)
                    }}>
                    <NFTItem previewUrl={asset.info.image_preview_url} detailUrl={asset.info.animation_url} />
                    <NFTBadges
                        location="overlay"
                        chain={asset.type.split('-')[0]}
                        collectionImg={asset.info.collection_icon}
                    />
                </div>
            ))}
        </section>
    )
}
