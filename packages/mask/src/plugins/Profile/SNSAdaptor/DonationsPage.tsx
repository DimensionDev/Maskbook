import { useState, useEffect } from 'react'
import DonationCard from './components/DonationCard'
import type { GeneralAssetWithTags } from './common/types'
import { Typography } from '@mui/material'
import config from './common/config'
import Button from './components/Button'
import { COLORS } from './common/variables'
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
interface DonationPageProps {
    address: string
    isOwned: boolean
    isConnected: boolean
}
export function DonationPage(props: DonationPageProps) {
    const { address, isOwned, isConnected } = props
    const { classes } = useStyles()

    const [listedDonation, setlistedDonation] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setLoading] = useState(true)

    const toSingleDonation = (platform: string, identity: string, id: string, type: string) => {
        window.open(
            `https://rss3.bio/${address}/singlegitcoin/${platform}/${identity}/${id}/${type}`,
            '_blank',
            'noopener noreferrer',
        )
    }

    const loadDonations = async () => {
        const { listed } = await utils.initAssets('Gitcoin-Donation')
        setLoading(false)
        setlistedDonation(listed)
    }

    useEffect(() => {
        loadDonations()
    }, [])

    return (
        <>
            {address !== '' ? (
                isConnected ? (
                    isLoading ? (
                        <div className="flex justify-center items-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div>
                            <section className="flex flex-row justify-between items-center w-full gap-4">
                                <Typography className={classes.primaryText} variant="subtitle1" color="textPrimary">
                                    {formatter(address)}
                                </Typography>
                                {isOwned ? (
                                    <Button
                                        isOutlined={true}
                                        color={COLORS.donation}
                                        text="Edit"
                                        onClick={() => {
                                            window.open(`https://rss3.bio/`, '_blank', 'noopener noreferrer')
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
                    )
                ) : (
                    <div className="text-center my-8">
                        <Typography className={classes.msg} variant="body1">
                            {isOwned
                                ? 'Please connect your RSS3 profile.'
                                : 'This user has not connected with RSS3 yet.'}
                        </Typography>
                    </div>
                )
            ) : (
                <div className="text-center my-8">
                    <Typography className={classes.msg} variant="body1">
                        {isOwned
                            ? 'Please connect an Ethereum compatible wallet.'
                            : 'This user has not connected any Ethereum compatible wallet.'}
                    </Typography>
                </div>
            )}
        </>
    )
}
