import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
import type { RSS3Index } from 'rss3-next/types/rss3'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useEthereumAddress } from '@masknet/web3-shared-evm'
import { MaskMessages } from '../../../utils'
import { useLocationChange } from '../../../utils/hooks/useLocationChange'
import { WalletsPage } from './WalletsPage'
import { NFTPage } from './NFTPage'
import { DonationPage } from './DonationsPage'
import { FootprintPage } from './FootprintPage'
import { DAOPage } from './DAOPage'
import { PageTags } from '../types'
import { PageTag } from './PageTag'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useDao } from './hooks'
import { PluginProfileRPC } from '../messages'

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

export interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const classes = useStylesExtends(useStyles(), props)

    //#region identity
    const identity = useCurrentVisitingIdentity()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { value: currentAccount } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )
    const isOwned = lastRecognizedIdentity.identifier.equals(identity.identifier)
    const currentAccountAddress = currentAccount?.address ?? ''
    //#endregion

    const [hidden, setHidden] = useState(true)
    const { value: daoPayload } = useDao(identity.identifier)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    const [isConnected, setConnected] = useState(false)
    const [username, setUsername] = useState<string>('')

    const init = async (account: string) => {
        await PluginProfileRPC.setPageOwner(account)
        const pageOwner = await PluginProfileRPC.getPageOwner()
        const apiUser = await PluginProfileRPC.getAPIUser()
        const rss3Username = (await apiUser.persona?.profile.get(pageOwner.address))?.name ?? ''
        setUsername(rss3Username)
        const rss3Sign = ((await apiUser.persona?.files.get(pageOwner.address)) as RSS3Index).signature
        setConnected(rss3Sign !== '')
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
                return <NFTPage />
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
            case PageTags.DAOTag:
                return <DAOPage payload={daoPayload} identifier={identity.identifier} />
            default:
                unreachable(currentTag)
        }
    }, [currentTag, currentAccountAddress, isOwned, isConnected, username, daoPayload, identity.identifier])

    useUpdateEffect(() => {
        setCurrentTag(PageTags.NFTTag)
    }, [identity.identifier])

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
