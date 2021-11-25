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
import { unreachable } from '@dimensiondev/kit'
import { useAccount } from '@masknet/plugin-infra'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { useEthereumAddress } from '@masknet/web3-shared-evm'

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
    const identity = useCurrentVisitingIdentity()
    const { loading: loadingENS, value: currentAccount } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )

    const [isOwnAddress, setIsOwnAddress] = useState<boolean>(false)
    const [show, setShow] = useState(false)
    const classes = useStylesExtends(useStyles(), props)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.WalletTag)

    const [persona, setPersona] = useState<RSS3DetailPersona | undefined>(undefined)

    const init = async (currentAccount: any) => {
        await RSS3.setPageOwner(currentAccount?.address)
        const pageOwner = RSS3.getPageOwner()
        const apiUser = RSS3.getAPIUser()
        const rss3Asset = await (apiUser.persona as IRSS3).assets.get(pageOwner.address)
        setPersona(pageOwner)
    }

    useLocationChange(() => {
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        if (!loadingENS && currentAccount?.address !== '') {
            init(currentAccount)
            setIsOwnAddress(currentAccount?.address === address)
        }
        console.log(currentAccount)
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [identity, currentAccount])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage address={currentAccount?.address || ''} isOwnAddress={isOwnAddress} />
            case PageTags.DonationTag:
                return <DonationPage address={currentAccount?.address || ''} isOwnAddress={isOwnAddress} />
            case PageTags.FootprintTag:
                return (
                    <FootprintPage
                        username={persona?.profile?.name || ''}
                        address={currentAccount?.address || ''}
                        isOwnAddress={isOwnAddress}
                    />
                )
            case PageTags.ConnectRSS3:
                return <ConnectRSS3Page isOwnAddress={isOwnAddress} />
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
                    <PageTag onChange={(tag) => setCurrentTag(tag)} tag={currentTag} isOwnAddress={isOwnAddress} />
                </div>
                <div className={classes.content}>{content}</div>
            </div>
        </>
    )
}
