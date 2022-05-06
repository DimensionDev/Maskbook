import { ReversedAddress } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { AddressName, formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Button, MenuItem, Typography } from '@mui/material'
import { first, uniqBy } from 'lodash-unified'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useI18N } from '../locales'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
    useDonations,
    useFootprints,
    useCurrentPersona,
    getKV,
    useCurrentVisitingProfile,
    useCollectionFilter,
} from './hooks'
import { DonationPage, FootprintPage } from './pages'
import type { kvType } from '../types'

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
    type: TabCardType
    addressNames: AddressName[]
}

export function TabCard({ type, addressNames }: TabCardProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [selectedAddress, setSelectedAddress] = useState(first(addressNames))

    const { value: donations = EMPTY_LIST, loading: loadingDonations } = useDonations(
        formatEthereumAddress(selectedAddress?.resolvedAddress ?? ZERO_ADDRESS),
    )
    const { value: footprints = EMPTY_LIST, loading: loadingFootprints } = useFootprints(
        formatEthereumAddress(selectedAddress?.resolvedAddress ?? ZERO_ADDRESS),
    )
    const currentVisitingProfile = useCurrentVisitingProfile()
    const currentPersona = useCurrentPersona()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onClose = () => setAnchorEl(null)
    const onSelect = (option: AddressName) => {
        setSelectedAddress(option)
        onClose()
    }

    const { value: kvValue } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getKV(currentPersona?.publicKeyAsHex!)
    }, [currentPersona])
    const unHiddenDonations = useCollectionFilter(
        (kvValue as kvType)?.proofs,
        donations,
        'Donations',
        currentVisitingProfile,
        selectedAddress,
    )
    const unHiddenFootprints = useCollectionFilter(
        (kvValue as kvType)?.proofs,
        footprints,
        'Footprints',
        currentVisitingProfile,
        selectedAddress,
    )
    if (!selectedAddress) return null

    const isDonation = type === TabCardType.Donation

    const summary =
        isDonation && !loadingDonations ? (
            <Typography color="textPrimary" component="span">
                {t.total_grants({
                    count: unHiddenDonations?.length.toString() ?? '0',
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
                        <ReversedAddress address={selectedAddress.resolvedAddress} />
                        <KeyboardArrowDownIcon />
                    </Button>
                    <ShadowRootMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        PaperProps={{ style: { maxHeight: 192 } }}
                        aria-labelledby="demo-positioned-button"
                        onClose={() => setAnchorEl(null)}>
                        {uniqBy(addressNames ?? [], (x) => x.resolvedAddress.toLowerCase()).map((x) => {
                            return (
                                <MenuItem key={x.resolvedAddress} value={x.resolvedAddress} onClick={() => onSelect(x)}>
                                    <ReversedAddress address={x.resolvedAddress} />
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
                    address={selectedAddress.resolvedAddress}
                    loading={loadingFootprints}
                    footprints={unHiddenFootprints}
                    addressLabel={selectedAddress.label}
                />
            )}
        </>
    )
}
