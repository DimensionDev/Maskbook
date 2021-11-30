import { useState, useEffect, useMemo } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { MaskMessages } from '../../../utils'
import { useLocationChange } from '../../../utils/hooks/useLocationChange'
import { WalletsPage } from './WalletsPage'
import { NFTPage } from './NFTPage'
import { DonationPage } from './DonationsPage'
import { FootprintPage } from './FootprintPage'
import { ConnectRSS3Page } from './ConnectRSS3'
import { DAOPage } from './DAOPage'
import { PageTags } from '../types'
import { PageTag } from './PageTag'
import RSS3, { IRSS3 } from './common/rss3'
import { unreachable } from '@dimensiondev/kit'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useEthereumAddress } from '@masknet/web3-shared-evm'
import type { RSS3Index } from 'rss3-next/types/rss3'
import { useDao } from './hooks/useDao'

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
    const classes = useStylesExtends(useStyles(), props)

    //#region identity
    const identity = useCurrentVisitingIdentity()
    const lastRegonizedIdentity = useLastRecognizedIdentity()
    const { value: currentAccount } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )
    const isOwned = lastRegonizedIdentity.identifier.equals(identity.identifier)
    const currentAccountAddress = currentAccount?.address ?? ''
    //#endregion

    //#region DAO
    const userId = identity.identifier.userId.toLowerCase()
    const { value: daoPayload } = useDao(userId)
    //#endregion

    const [hidden, setHidden] = useState(true)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    const [isConnected, setConnected] = useState(false)
    const [username, setUsername] = useState<string>('')

    const init = async (account: string) => {
        await RSS3.setPageOwner(account)
        const pageOwner = RSS3.getPageOwner()
        const apiUser = RSS3.getAPIUser()
        const rss3Username = (await (apiUser.persona as IRSS3).profile.get(pageOwner.address)).name
        setUsername(rss3Username || '')
        const rss3Sign = ((await (apiUser.persona as IRSS3).files.get(pageOwner.address)) as RSS3Index).signature
        setConnected(rss3Sign === '' ? false : true)
    }

    useLocationChange(() => {
        setCurrentTag(PageTags.NFTTag)
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        if (currentAccountAddress) init(currentAccountAddress)
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity, currentAccountAddress, isConnected])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage address={currentAccountAddress} isOwned={isOwned} isConnected={isConnected} />
            case PageTags.DonationTag:
                return <DonationPage address={currentAccountAddress} isOwned={isOwned} isConnected={isConnected} />
            case PageTags.FootprintTag:
                return (
                    <FootprintPage
                        username={username}
                        address={currentAccountAddress}
                        isOwned={isOwned}
                        isConnected={isConnected}
                    />
                )
            case PageTags.ConnectRSS3:
                return <ConnectRSS3Page isOwned={isOwned} />
            case PageTags.DAOTag:
                return <DAOPage payload={daoPayload} userId={userId} />
            default:
                unreachable(currentTag)
        }
    }, [currentTag, currentAccountAddress, isOwned, isConnected, username, daoPayload])

    if (hidden) return null

    return (
        <>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <div className={classes.root}>
                <div className={classes.tags}>
                    <PageTag
                        daoPayload={daoPayload}
                        tag={currentTag}
                        isOwned={isOwned}
                        onChange={(tag) => setCurrentTag(tag)}
                    />
                </div>
                <div className={classes.content}>{content}</div>
            </div>
        </>
    )
}
