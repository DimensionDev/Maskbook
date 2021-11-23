import { useState, useEffect } from 'react'
import NFTItem from './components/NFTItem'
import NFTBadges from './components/NFTBadges'
import Button from './components/Button'
import type { GeneralAssetWithTags } from './common/types'
import { COLORS } from './common/variables'
import { Typography } from '@mui/material'
import RSS3 from './common/rss3'
import { makeStyles } from '@masknet/theme'
import formatter from './common/address'
import { CircularProgress } from '@mui/material'
import utils from './common/utils'

const useStyles = makeStyles()((theme) => ({
    msg: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    },
    primaryText: {
        color: theme.palette.primary.main,
    },
}))
interface NFTPageProps {
    address: string
    isOwnAddress: boolean
}

export function NFTPage(props: NFTPageProps) {
    const { address, isOwnAddress } = props
    const { classes } = useStyles()

    const { listedNFT, address } = props

    const [isConnected, setIsConnected] = useState(false)
    const [listedNFT, setlistedNFT] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const toSingleFootprint = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlenft/${platform}/${identity}/${id}/${type}`)
    }

    const loadNFTs = async () => {
        const { listed } = await utils.initAssets('NFT')
        setIsLoading(false)
        setlistedNFT(listed)
    }

    useEffect(() => {
        if (Object.keys(RSS3.getPageOwner()).length !== 0) {
            setIsConnected(true)
        } else {
            setIsConnected(false)
        }
        loadNFTs()
    }, [isLoading])

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <CircularProgress />
                </div>
            ) : address !== '' ? (
                isConnected ? (
                    <div>
                        <section className="flex flex-row justify-between items-center w-full gap-4">
                            <div className="text-nft">
                                <Typography className={classes.primaryText} variant="subtitle1">
                                    {formatter(address)}
                                </Typography>
                            </div>
                            {isOwnAddress ? (
                                <Button
                                    isOutlined={true}
                                    color={COLORS.nft}
                                    text="Edit"
                                    onClick={() => {
                                        window.open(`https://rss3.bio/`)
                                    }}
                                />
                            ) : (
                                ''
                            )}
                        </section>
                        <section className="grid gap-4 py-4 grid-cols-2 md:grid-cols-3 justify-items-center">
                            {listedNFT.map((asset, index) => (
                                <div
                                    key={index}
                                    className="relative cursor-pointer w-full"
                                    onClick={() => {
                                        toSingleFootprint(asset.platform, asset.identity, asset.id, asset.type)
                                    }}>
                                    <NFTItem
                                        previewUrl={asset.info.image_preview_url}
                                        detailUrl={asset.info.animation_url}
                                    />
                                    <NFTBadges
                                        location="overlay"
                                        chain={asset.type.split('-')[0]}
                                        collectionImg={asset.info.collection_icon}
                                    />
                                </div>
                            ))}
                        </section>
                    </div>
                ) : (
                    <div className="text-center my-8">
                        <Typography className={classes.msg} variant="body1">
                            {isOwnAddress
                                ? 'Please connect your RSS3 profile'
                                : 'This user has not connect with RSS3 yet'}
                        </Typography>
                    </div>
                )
            ) : (
                <div className="text-center my-8">
                    <Typography className={classes.msg} variant="body1">
                        {isOwnAddress
                            ? 'Please connect an Ethereum compatible wallet'
                            : 'This user has not connect any Ethereum compatible wallet'}
                    </Typography>
                </div>
            )}
        </>
    )
}
