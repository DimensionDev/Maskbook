import { useState } from 'react'
import { first, uniqBy } from 'lodash-unified'
import { ReversedAddress } from '@masknet/shared'
import { getMaskColor, makeStyles, ShadowRootMenu } from '@masknet/theme'
import { MenuItem } from '@mui/material'
import { SocialAddress, NetworkPluginID, SocialIdentity, SocialAddressType } from '@masknet/web3-shared-base'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useCurrentVisitingProfile } from '../hooks/useContext'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
    note: {
        padding: `0 ${theme.spacing(1)}`,
        textAlign: 'right',
    },
    icon: {
        color: getMaskColor(theme).textPrimary,
    },
    iconContainer: {
        display: 'inherit',
    },
    tipList: {
        listStyleType: 'decimal',
        paddingLeft: 16,
    },
    button: {
        border: `1px solid ${theme.palette.text.primary} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderRadius: 9999,
        background: 'transparent',
        '&:hover': {
            background: 'rgba(15, 20, 25, 0.1)',
        },
    },
}))

export interface NFTPageProps {
    persona?: string
    identity?: SocialIdentity
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

export function NFTPage({ socialAddressList, persona }: NFTPageProps) {
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [selectedAddress, setSelectedAddress] = useState(first(socialAddressList))
    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onClose = () => setAnchorEl(null)
    const onSelect = (option: SocialAddress<NetworkPluginID>) => {
        setSelectedAddress(option)
        onClose()
    }
    const currentVisitingProfile = useCurrentVisitingProfile()

    if (!selectedAddress) return null

    return (
        <div className={classes.root}>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                PaperProps={{ style: { maxHeight: 192 } }}>
                {uniqBy(socialAddressList ?? EMPTY_LIST, (x) => x.address.toLowerCase()).map((x) => {
                    return (
                        <MenuItem key={x.address} value={x.address} onClick={() => onSelect(x)}>
                            {x.type === SocialAddressType.ADDRESS || x.type === SocialAddressType.KV ? (
                                <ReversedAddress address={x.address} pluginId={x.networkSupporterPluginID} />
                            ) : (
                                x.label
                            )}
                        </MenuItem>
                    )
                })}
            </ShadowRootMenu>
            <CollectionList
                addressName={selectedAddress}
                onSelectAddress={onOpen}
                persona={persona}
                visitingProfile={currentVisitingProfile}
            />
        </div>
    )
}
