import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, MenuItem, Button } from '@mui/material'
import { ShadowRootMenu, useI18N } from '../../../utils'
import type { AddressName } from '@masknet/web3-shared-evm'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { useState } from 'react'
import { first, uniqBy } from 'lodash-unified'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

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
    addressNames?: AddressName[]
}

export function NFTPage(props: NFTPageProps) {
    const { addressNames } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [selectedAddress, setSelectedAddress] = useState(first(addressNames))
    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onClose = () => setAnchorEl(null)
    const onSelect = (option: AddressName) => {
        setSelectedAddress(option)
        onClose()
    }

    if (!selectedAddress) return null

    return (
        <div className={classes.root}>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                PaperProps={{ style: { maxHeight: 192 } }}>
                {uniqBy(addressNames ?? [], (x) => x.resolvedAddress.toLowerCase()).map((x) => {
                    return (
                        <MenuItem key={x.resolvedAddress} value={x.resolvedAddress} onClick={() => onSelect(x)}>
                            {x.type}: {formatEthereumAddress(x.label, 5)}
                        </MenuItem>
                    )
                })}
            </ShadowRootMenu>
            <Box className={classes.note} display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                <Button onClick={onOpen} className={classes.button} variant="outlined">
                    {formatEthereumAddress(selectedAddress.label, 5)}
                    <KeyboardArrowDownIcon />
                </Button>
            </Box>
            <CollectionList address={selectedAddress.resolvedAddress ?? ''} />
        </div>
    )
}
