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
import RSS3, { IRSS3 } from './common/rss3'
import { unreachable } from '@dimensiondev/kit'
import { useAccount } from '@masknet/plugin-infra'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { isSameAddress, useEthereumAddress } from '@masknet/web3-shared-evm'
import type { RSS3Index } from 'rss3-next/types/rss3'

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

    const [isOwnAddress, setOwnAddress] = useState(false)
    const [hidden, setHidden] = useState(true)
    const classes = useStylesExtends(useStyles(), props)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.WalletTag)

    const [isConnected, setIsConnected] = useState(false)
    const [username, setUsername] = useState<string>('')

    const init = async (currentAccount: any) => {
        await RSS3.setPageOwner(currentAccount?.address)
        const pageOwner = RSS3.getPageOwner()
        const apiUser = RSS3.getAPIUser()
        const rss3Username = (await (apiUser.persona as IRSS3).profile.get(pageOwner.address)).name
        setUsername(rss3Username || '')
        const rss3Sign = ((await (apiUser.persona as IRSS3).files.get(pageOwner.address)) as RSS3Index).signature
        setIsConnected(rss3Sign === '' ? false : true)
    }

    useLocationChange(() => {
        setCurrentTag(PageTags.WalletTag)
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        if (!loadingENS && currentAccount?.address !== '') {
            init(currentAccount)
            setOwnAddress(isSameAddress(currentAccount?.address, address))
        }

        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity, currentAccount, isConnected])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return (
                    <NFTPage
                        address={currentAccount?.address || ''}
                        isOwnAddress={isOwnAddress}
                        isConnected={isConnected}
                    />
                )
            case PageTags.DonationTag:
                return (
                    <DonationPage
                        address={currentAccount?.address || ''}
                        isOwnAddress={isOwnAddress}
                        isConnected={isConnected}
                    />
                )
            case PageTags.FootprintTag:
                return (
                    <FootprintPage
                        username={username}
                        address={currentAccount?.address || ''}
                        isOwnAddress={isOwnAddress}
                        isConnected={isConnected}
                    />
                )
            case PageTags.ConnectRSS3:
                return <ConnectRSS3Page isOwnAddress={isOwnAddress} />
            default:
                unreachable(currentTag)
        }
    }, [currentTag])

    if (hidden) return null

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
