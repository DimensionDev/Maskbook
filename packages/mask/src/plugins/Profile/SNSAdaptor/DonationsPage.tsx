import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import { CircularProgress, Link, Typography } from '@mui/material'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { COLORS } from './common/variables'
import { Button, DonationCard } from './components'
import { useDonations } from './hooks'
import config from '../apis/config'
import type { GeneralAssetWithTags } from '../apis/types'

const getDonationLink = (address: string, donation: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = donation
    return urlcat('https://rss3.bio/:address/singlegitcoin/:platform/:identity/:id/:type', {
        address,
        platform,
        identity,
        id,
        type,
    })
}

const useStyles = makeStyles()((theme) => ({
    msg: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    },
    primaryText: {
        color: theme.palette.primary.main,
    },
    link: {
        '&:hover': {
            textDecoration: 'none',
        },
    },
}))

export interface DonationPageProps {
    address: string
    isOwned: boolean
}

// cspell:ignore contribs
export function DonationPage(props: DonationPageProps) {
    const { address, isOwned } = props
    const { classes } = useStyles()
    const { donations, loading } = useDonations()

    if (!address) {
        return (
            <div className="text-center my-8">
                <Typography className={classes.msg} variant="body1">
                    {isOwned
                        ? 'Please connect an Ethereum compatible wallet.'
                        : 'This user has not connected any Ethereum compatible wallet.'}
                </Typography>
            </div>
        )
    }
    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <CircularProgress />
            </div>
        )
    }
    return (
        <div>
            <section className="flex flex-row justify-between items-center w-full gap-4">
                <Typography className={classes.primaryText} variant="subtitle1" color="textPrimary" title={address}>
                    {formatEthereumAddress(address, 6)}
                </Typography>
                {isOwned ? (
                    <Button
                        isOutlined={true}
                        color={COLORS.donation}
                        text="Edit"
                        onClick={() => {
                            window.open('https://rss3.bio', '_blank', 'noopener noreferrer')
                        }}
                    />
                ) : null}
            </section>
            <section className="grid grid-cols-1 gap-4 py-4">
                {donations.map((donation) => (
                    <Link
                        className={classes.link}
                        href={getDonationLink(address, donation)}
                        key={donation.id}
                        target="_blank"
                        rel="noopener noreferrer">
                        <DonationCard
                            imageUrl={donation.info.image_preview_url || config.undefinedImageAlt}
                            name={donation.info.title || 'Inactive Project'}
                            contribCount={donation.info.total_contribs || 0}
                            contribDetails={donation.info.token_contribs || []}
                        />
                    </Link>
                ))}
            </section>
        </div>
    )
}
