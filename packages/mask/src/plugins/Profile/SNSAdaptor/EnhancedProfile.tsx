import { useState, useEffect, useMemo } from 'react'
import { useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

import { MaskMessages } from '../../../utils'
import { useLocationChange } from '../../../utils/hooks/useLocationChange'
import { WalletsPage } from './WalletsPage'
import { NFTPage } from './NFTPage'
import { DonationPage } from './DonationsPage'
import { FootprintPage } from './FootprintPage'
import { ConnectRSS3Page } from './ConnectRSS3'
import { PageTags } from '../types'
import { PageTag } from './PageTag'
import RSS3, { IRSS3, RSS3DetailPersona } from './common/rss3'
import type { GeneralAssetWithTags } from './common/types'
import utils from './common/utils'
import { unreachable } from '@dimensiondev/kit'
import { useAccount } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    tags: {
        padding: theme.spacing(2),
    },
    content: {
        position: 'relative',
        padding: theme.spacing(1),
    },
}))

interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const address = useAccount()

    const [show, setShow] = useState(false)
    const classes = useStylesExtends(useStyles(), props)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    const [persona, setPersona] = useState<RSS3DetailPersona | undefined>(undefined)

    const [listedNFT, setlistedNFT] = useState<GeneralAssetWithTags[]>([])
    const [listedDonation, setlistedDonation] = useState<GeneralAssetWithTags[]>([])
    const [listedFootprint, setListedFootprint] = useState<GeneralAssetWithTags[]>([])

    const init = async () => {
        // await RSS3.reconnect();
        // await RSS3.setPageOwner('0xDA048BED40d40B1EBd9239Cdf56ca0c2F018ae65')
        await RSS3.setPageOwner(address)
        const pageOwner = RSS3.getPageOwner()
        const apiUser = RSS3.getAPIUser()
        const rss3Asset = await (apiUser.persona as IRSS3).assets.get(pageOwner.address)

        const orderNFTs = await loadNFTs()
        setlistedNFT(orderNFTs)
        const orderDonations = await loadDonations()
        setlistedDonation(orderDonations)
        const orderFootprints = await loadFootprints()
        setListedFootprint(orderFootprints)
        setPersona(pageOwner)
    }

    const loadNFTs = async () => {
        const { listed } = await utils.initAssets('NFT')
        return listed
    }

    const loadDonations = async () => {
        const { listed } = await utils.initAssets('Gitcoin-Donation')
        return listed
    }

    const loadFootprints = async () => {
        const { listed } = await utils.initAssets('POAP')
        return listed
    }

    useLocationChange(() => {
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        init()
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage listedNFT={listedNFT} address={persona?.address || ''} />
            case PageTags.DonationTag:
                return <DonationPage listedDonation={listedDonation} address={persona?.address || ''} />
            case PageTags.FootprintTag:
                return (
                    <FootprintPage
                        listedFootprint={listedFootprint}
                        username={persona?.profile?.name || ''}
                        address={persona?.address || ''}
                    />
                )
            case PageTags.ConnectRSS3:
                return <ConnectRSS3Page />
            default:
                unreachable(currentTag)
        }
    }, [currentTag])

    if (!show) return null

    return (
        <>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <div className={classes.root}>
                <div className={classes.tags}>
                    <PageTag onChange={(tag) => setCurrentTag(tag)} tag={currentTag} />
                </div>
                <div className={classes.content}>{content}</div>
            </div>
        </>
    )
}
