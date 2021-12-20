import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
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
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { useDao, useAddressByRss3ProfileLink, useRss3Profile } from './hooks'

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
    const { value: currentAccount } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )
    const { address: addressByRssProfile } = useAddressByRss3ProfileLink(identity.homepage)
    const currentAccountAddress = currentAccount?.address || addressByRssProfile || ''
    //#endregion

    const [hidden, setHidden] = useState(true)
    const { value: daoPayload } = useDao(identity.identifier)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    const { profile } = useRss3Profile(currentAccountAddress)
    const username = profile.name

    useLocationChange(() => {
        setCurrentTag(PageTags.NFTTag)
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity, currentAccountAddress])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage />
            case PageTags.DonationTag:
                return <DonationPage address={currentAccountAddress} />
            case PageTags.FootprintTag:
                return <FootprintPage username={username} address={currentAccountAddress} />
            case PageTags.DAOTag:
                return <DAOPage payload={daoPayload} identifier={identity.identifier} />
            default:
                unreachable(currentTag)
        }
    }, [currentTag, currentAccountAddress, username, daoPayload, identity.identifier])

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
                        address={currentAccountAddress}
                        daoPayload={daoPayload}
                        tag={currentTag}
                        onChange={setCurrentTag}
                    />
                </div>
                <div className={classes.content}>{content}</div>
            </div>
        </>
    )
}
