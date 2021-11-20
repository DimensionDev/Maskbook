import config from '../common/config'

interface NFTBadgesProps {
    location: 'overlay' | 'header'
    chain: string
    collectionImg?: string | null
}

const NFTBadges = ({ location, chain, collectionImg }: NFTBadgesProps) => {
    const containerClass = `${classes.containerBase} ${classes.containerExtend[location]}`
    const badgeClass = `${classes.badgeBase} ${classes.badgeExtend[location]}`
    const chainBaseClass = 'w-6 h-6 bg-white rounded-full'
    const chainClass = `w-full h-full ${classes.badgeBase}`

    const collectionImgStyle = {
        backgroundImage: `url(${collectionImg})`,
    }

    let address = new URL(config.undefinedImageAlt, import.meta.url)

    if (chain === 'BSC') {
        address = new URL('../icons/chains/BSC.png', import.meta.url)
    } else if (chain === 'Ethereum') {
        address = new URL('../icons/chains/Ethereum.png', import.meta.url)
    } else if (chain === 'Polygon') {
        address = new URL('../icons/chains/Polygon.png', import.meta.url)
    } else if (chain === 'Ronin') {
        address = new URL('../icons/chains/Ronin.png', import.meta.url)
    }

    const chainImgStyle = {
        backgroundImage: `url(${address})`,
    }

    return (
        <div className={containerClass}>
            {collectionImg && <div className={badgeClass} style={collectionImgStyle} />}
            <div className={chainBaseClass}>
                <div className={chainClass} style={chainImgStyle} />
            </div>
        </div>
    )
}

const classes = {
    containerBase: 'flex flex-row gap-1 items-center justify-end',
    containerExtend: {
        overlay: 'absolute right-2.5 top-2.5',
        header: '',
    },
    badgeBase: 'bg-center bg-no-repeat bg-cover rounded-full bg-item-bg border-sm border-item-border shadow-nft',
    badgeExtend: {
        overlay: 'w-6 h-6',
        header: 'w-7 h-7',
    },
}

export default NFTBadges
