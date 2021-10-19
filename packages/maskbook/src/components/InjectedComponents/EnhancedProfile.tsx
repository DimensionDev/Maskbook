import { useState, useEffect } from 'react'
import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    ChainId,
    EthereumNameType,
    useEthereumAddress,
} from '@masknet/web3-shared-evm'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { Box, Link, Typography } from '@material-ui/core'
import { CollectibleListAddress } from '../../extension/options-page/DashboardComponents/CollectibleList'
import { MaskMessages, useI18N } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'

const RULE_TIP = [
    '1. Twitter name or bio contains ENS (e.g. vitalik.eth);',
    '2. Twitter bio contains valid Ethereum address;',
    '3. The ENS or Ethereum address has NFTs in it.',
].join('\n')

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
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
}))

interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {
    bioDescription: string
    nickname: string
    twitterId: string
}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const [show, setShow] = useState(false)
    const classes = useStylesExtends(useStyles(), props)
    const { bioDescription, nickname, twitterId } = props
    const { t } = useI18N()

    useLocationChange(() => {
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const { value } = useEthereumAddress(nickname, twitterId, bioDescription)

    if (!show) return null

    const { type, name, address } = value ?? {}

    if (!address)
        return (
            <div className={classes.root}>
                <Box className={classes.text} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                </Box>
            </div>
        )
    return (
        <div className={classes.root}>
            <Box className={classes.note} display="flex" alignItems="center" justifyContent="flex-end">
                <Typography color="textPrimary" component="span">
                    Current display of {type}:{' '}
                    <Link
                        href={resolveAddressLinkOnExplorer(ChainId.Mainnet, address)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {type === EthereumNameType.DEFAULT ? formatEthereumAddress(address, 4) : name}
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
            <CollectibleListAddress address={address} />
        </div>
    )
}
