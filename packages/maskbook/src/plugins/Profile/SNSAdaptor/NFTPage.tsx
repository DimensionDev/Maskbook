import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    ChainId,
    EthereumNameType,
    useEthereumAddress,
} from '@masknet/web3-shared-evm'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Link, Typography } from '@mui/material'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { CollectibleListAddress } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { useI18N } from '../../../utils'

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

interface NFTPageProps extends withClasses<'text' | 'button'> {}

export function NFTPage(props: NFTPageProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const identity = useCurrentVisitingIdentity()

    const { value } = useEthereumAddress(identity.nickname ?? '', identity.identifier.userId, identity.bio ?? '')

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
