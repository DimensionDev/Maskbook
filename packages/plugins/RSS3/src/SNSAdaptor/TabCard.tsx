import { ReversedAddress } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Button, MenuItem, Typography } from '@mui/material'
import { first, uniqBy } from 'lodash-unified'
import { useState } from 'react'
import { useI18N } from '../locales'
import { useCollectionFilter, useDonations, useFootprints } from './hooks'
import { DonationPage, FootprintPage } from './pages'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useCurrentVisitingProfile } from './hooks/useContext'
import { CollectionType, KVType } from '../types'
import { useKV } from './hooks/useKV'

const useStyles = makeStyles()((theme) => ({
    button: {
        border: `1px solid ${theme.palette.text.primary} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderRadius: 4,
        background: 'transparent',
        '&:hover': {
            background: 'rgba(15, 20, 25, 0.1)',
        },
    },
}))

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
}

export interface TabCardProps {
    persona?: string
    type: TabCardType
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

export function TabCard({ type, socialAddressList, persona }: TabCardProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [selectedAddress, setSelectedAddress] = useState(first(socialAddressList))

    const { value: donations = EMPTY_LIST, loading: loadingDonations } = useDonations(
        formatEthereumAddress(selectedAddress?.address ?? ZERO_ADDRESS),
    )
    const { value: footprints = EMPTY_LIST, loading: loadingFootprints } = useFootprints(
        formatEthereumAddress(selectedAddress?.address ?? ZERO_ADDRESS),
    )
    const currentVisitingProfile = useCurrentVisitingProfile()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onClose = () => setAnchorEl(null)
    const onSelect = (option: SocialAddress<NetworkPluginID>) => {
        setSelectedAddress(option)
        onClose()
    }

    const { value: kvValue } = useKV(persona)
    const unHiddenDonations = useCollectionFilter(
        kvValue?.proofs ?? EMPTY_LIST,
        donations,
        CollectionType.Donations,
        currentVisitingProfile,
        selectedAddress,
    )
    const unHiddenFootprints = useCollectionFilter(
        (kvValue as KVType)?.proofs,
        footprints,
        CollectionType.Footprints,
        currentVisitingProfile,
        selectedAddress,
    )

    if (!selectedAddress) return null

    const isDonation = type === TabCardType.Donation

    const summary =
        isDonation && !loadingDonations ? (
            <Typography color="textPrimary" component="span">
                {t.total_grants({
                    count: donations.length.toString(),
                })}
            </Typography>
        ) : null

    return (
        <>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                }}>
                <div>{summary}</div>
                <div>
                    <Button
                        id="demo-positioned-button"
                        variant="outlined"
                        size="small"
                        onClick={onOpen}
                        className={classes.button}>
                        {selectedAddress?.type === SocialAddressType.KV ||
                        selectedAddress?.type === SocialAddressType.ADDRESS ? (
                            <ReversedAddress address={selectedAddress.address} />
                        ) : (
                            selectedAddress.label
                        )}
                        <KeyboardArrowDownIcon />
                    </Button>
                    <ShadowRootMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        PaperProps={{ style: { maxHeight: 192 } }}
                        aria-labelledby="demo-positioned-button"
                        onClose={() => setAnchorEl(null)}>
                        {uniqBy(socialAddressList ?? [], (x) => x.address.toLowerCase()).map((x) => {
                            return (
                                <MenuItem key={x.address} value={x.address} onClick={() => onSelect(x)}>
                                    {selectedAddress?.type === SocialAddressType.KV ||
                                    selectedAddress?.type === SocialAddressType.ADDRESS ? (
                                        <ReversedAddress address={x.address} />
                                    ) : (
                                        x.label
                                    )}
                                </MenuItem>
                            )
                        })}
                    </ShadowRootMenu>
                </div>
            </div>
            {isDonation ? (
                <DonationPage
                    donations={unHiddenDonations}
                    loading={loadingDonations}
                    addressLabel={selectedAddress.label}
                />
            ) : (
                <FootprintPage
                    address={selectedAddress.address}
                    loading={loadingFootprints}
                    footprints={unHiddenFootprints}
                    addressLabel={selectedAddress.label}
                />
            )}
        </>
    )
}
