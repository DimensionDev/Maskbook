import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Box, Typography } from '@mui/material'
import { unreachable } from '@dimensiondev/kit'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { AddressNameType, useAddressNames } from '@masknet/web3-shared-evm'
import { MaskMessages, useI18N } from '../../../utils'
import { useLocationChange } from '../../../utils/hooks/useLocationChange'
import { WalletsPage } from './WalletsPage'
import { NFTPage } from './NFTPage'
import { DonationPage } from './DonationsPage'
import { FootprintPage } from './FootprintPage'
import { DAOPage } from './DAOPage'
import { PageTags } from '../types'
import { PageTag } from './PageTag'
import { AddressViewer } from './components/AddressViewer'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { useDao } from './hooks'

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
    metadata: {},
    content: {
        position: 'relative',
        padding: theme.spacing(1),
    },
}))

export interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const identity = useCurrentVisitingIdentity()
    const { value: addressNames, loading: loadingAddressNames } = useAddressNames(identity)
    const { value: daoPayload, loading: loadingDAO } = useDao(identity.identifier)

    const [hidden, setHidden] = useState(true)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    useLocationChange(() => {
        setCurrentTag(PageTags.NFTTag)
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity])

    useUpdateEffect(() => {
        setCurrentTag(PageTags.NFTTag)
    }, [identity.identifier])

    const addressName = useMemo(() => {
        const getAddressByType = (type: AddressNameType) => addressNames?.find((x) => x.type === type)

        const addressLiteral = getAddressByType(AddressNameType.ADDRESS)
        const addressENS = getAddressByType(AddressNameType.ENS)
        const addressUNS = getAddressByType(AddressNameType.UNS)
        const addressGUN = getAddressByType(AddressNameType.GUN)
        const addressRSS3 = getAddressByType(AddressNameType.RSS3)
        const addressTheGraph = getAddressByType(AddressNameType.THE_GRAPH)

        switch (currentTag) {
            case PageTags.WalletTag:
                return
            case PageTags.NFTTag:
                return addressENS || addressUNS || addressRSS3 || addressLiteral || addressGUN || addressTheGraph
            case PageTags.DonationTag:
                return addressRSS3 || addressENS || addressUNS || addressLiteral || addressGUN || addressTheGraph
            case PageTags.FootprintTag:
                return addressRSS3 || addressENS || addressUNS || addressLiteral || addressGUN || addressTheGraph
            case PageTags.DAOTag:
                return
            default:
                unreachable(currentTag)
        }
    }, [currentTag, addressNames])

    const address = addressName?.resolvedAddress ?? ''

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage address={address} />
            case PageTags.DonationTag:
                return <DonationPage address={address} />
            case PageTags.FootprintTag:
                return <FootprintPage address={address} />
            case PageTags.DAOTag:
                return <DAOPage payload={daoPayload} identifier={identity.identifier} />
            default:
                unreachable(currentTag)
        }
    }, [address, currentTag, daoPayload, identity.identifier])

    if (hidden) return null

    if (loadingAddressNames || loadingDAO)
        return (
            <div className={classes.root}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <Typography color="textPrimary">{t('plugin_profile_loading')}</Typography>
                </Box>
            </div>
        )

    if (!addressName && !daoPayload)
        return (
            <div className={classes.root}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <Typography color="textPrimary">{t('plugin_profile_error_no_address')}</Typography>
                </Box>
            </div>
        )

    return (
        <div className={classes.root}>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <div className={classes.tags}>
                <PageTag address={address} daoPayload={daoPayload} tag={currentTag} onChange={setCurrentTag} />
            </div>
            <div className={classes.metadata}>
                <AddressViewer addressName={addressName} />
            </div>
            <div className={classes.content}>{content}</div>
        </div>
    )
}
