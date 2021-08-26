import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { formatEthereumAddress, resolveAddressLinkOnExplorer, useChainId } from '@masknet/web3-shared'
import { Box, Link, Typography } from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { useState, useEffect } from 'react'
import { CollectibleListAddress } from '../../extension/options-page/DashboardComponents/CollectibleList'
import { useEthereumAddress } from '../../social-network-adaptor/twitter.com/injection/useEthereumName'
import { MaskMessage } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'

const RULE_TIP = [
    'Binding Rule',
    '1. Their Twitter nickname is their ENS',
    '2. Their Twitter bio contains ENS',
    '3. Their Twitter bio contains a validated address',
    '4. Their Twitter id + “.eth” form their ENS',
].join('\n')

const useStyles = makeStyles()((theme) => ({
    note: {
        padding: theme.spacing(1),
        textAlign: 'right',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
    button: {},
}))

interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {
    bioDescription: string
    nickname: string
    twitterId: string
    onUpdated: () => void
}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const [show, setShow] = useState(false)
    const chainId = useChainId()
    const classes = useStylesExtends(useStyles(), props)
    const { bioDescription, nickname, twitterId, onUpdated } = props

    useLocationChange(() => {
        MaskMessage.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on((data) => {
            onUpdated()
        })
    }, [])

    useEffect(() => {
        return MaskMessage.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const { name, addressENS, addressUNS, address } = useEthereumAddress(nickname, twitterId, bioDescription)
    const address_ = addressENS ?? addressUNS ?? address ?? ''
    if (!show || !address_) return null
    return (
        <>
            <Box className={classes.note} display="flex" alignItems="center" justifyContent="flex-end">
                <Typography color="textPrimary" component="span">
                    Current display of {addressENS ? 'ENS' : addressUNS ? 'UNS' : 'address'}:{' '}
                    <Link
                        href={resolveAddressLinkOnExplorer(chainId, address_)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {addressENS || addressUNS ? name : formatEthereumAddress(address ?? '', 4)}
                    </Link>
                </Typography>
                <Typography
                    sx={{ lineHeight: 1, marginLeft: 0.5, cursor: 'pointer' }}
                    color="textPrimary"
                    component="span"
                    title={RULE_TIP}>
                    <InfoOutlinedIcon color="inherit" fontSize="small" />
                </Typography>
            </Box>
            <CollectibleListAddress
                classes={{
                    button: classes.button,
                }}
                address={address_}
            />
        </>
    )
}
