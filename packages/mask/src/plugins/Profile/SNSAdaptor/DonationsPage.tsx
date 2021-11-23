import { useState, useEffect } from 'react'
import DonationCard from './components/DonationCard'
import type { GeneralAssetWithTags } from './common/types'
import { Typography } from '@mui/material'
import RSS3 from './common/rss3'
import config from './common/config'
import Button from './components/Button'
import { COLORS } from './common/variables'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
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
interface DonationPageProps {
    address: string
    isOwnAddress: boolean
}
export function DonationPage(props: DonationPageProps) {
    const { address, isOwnAddress } = props
    const { classes } = useStyles()

    const { listedDonation, address } = props

    const [isConnected, setIsConnected] = useState(false)
    const [listedDonation, setlistedDonation] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const toSingleDonation = (platform: string, identity: string, id: string, type: string) => {
        window.open(`https://rss3.bio/${address}/singlegitcoin/${platform}/${identity}/${id}/${type}`)
    }

    const loadDonations = async () => {
        const { listed } = await utils.initAssets('Gitcoin-Donation')
        setIsLoading(false)
        setlistedDonation(listed)
    }

    useEffect(() => {
        if (Object.keys(RSS3.getPageOwner()).length !== 0) {
            setIsConnected(true)
        } else {
            setIsConnected(false)
        }
        loadDonations()
    }, [])

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
                            <Typography className={classes.primaryText} variant="subtitle1" color="textPrimary">
                                {formatter(address)}
                            </Typography>
                            {isOwnAddress ? (
                                <Button
                                    isOutlined={true}
                                    color={COLORS.donation}
                                    text="Edit"
                                    onClick={() => {
                                        window.open(`https://rss3.bio/`)
                                    }}
                                />
                            ) : (
                                ''
                            )}
                        </section>
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
