import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Link, Typography, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import { useSharedI18N } from '../../..'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: `0 ${theme.spacing(1)}`,
        textAlign: 'right',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
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
}))

export interface AddressViewerProps {
    identityAddress: SocialAddress<NetworkPluginID>
}

export function AddressViewer({ identityAddress }: AddressViewerProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { type, label, address } = identityAddress

    const typeMap: Record<SocialAddressType, string> = {
        [SocialAddressType.ADDRESS]: t.address_viewer_address_name_address(),
        [SocialAddressType.ENS]: t.address_viewer_address_name_ens(),
        [SocialAddressType.UNS]: t.address_viewer_address_name_uns(),
        [SocialAddressType.DNS]: t.address_viewer_address_name_dns(),
        [SocialAddressType.RSS3]: t.address_viewer_address_name_rns(),
        [SocialAddressType.GUN]: t.address_viewer_address_name_address(),
        [SocialAddressType.NEXT_ID]: t.address_viewer_address_name_address(),
        [SocialAddressType.THE_GRAPH]: t.address_viewer_address_name_address(),
        [SocialAddressType.TWITTER_BLUE]: t.address_viewer_address_name_twitter(),
    }

    const rulesTipMap = [
        t.address_viewer_binding_rule1(),
        t.address_viewer_binding_rule2(),
        t.address_viewer_binding_rule3(),
        t.address_viewer_binding_rule4(),
    ]

    const tooltipRender = (
        <div style={{ textAlign: 'left' }}>
            <Typography variant="body2">{t.address_viewer_binding_rules_title()}</Typography>
            <ul className={classes.tipList}>
                {rulesTipMap.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    )

    if (!address) return null

    return (
        <Box className={classes.root} display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
            <Box display="flex" alignItems="center">
                <Typography color="textPrimary" component="span">
                    {t.address_viewer_current_display_of({ type: typeMap[type] })}
                    <Link
                        href={explorerResolver.addressLink(ChainId.Mainnet, address)}
                        target="_blank"
                        rel="noopener noreferrer">
                        {formatEthereumAddress(label, 4)}
                    </Link>
                </Typography>
                <div className={classes.iconContainer}>
                    <Tooltip
                        title={tooltipRender}
                        arrow
                        placement="top"
                        PopperProps={{
                            disablePortal: true,
                        }}>
                        <InfoOutlinedIcon
                            fontSize="small"
                            className={classes.icon}
                            sx={{ lineHeight: 1, marginLeft: 0.5, cursor: 'pointer' }}
                        />
                    </Tooltip>
                </div>
            </Box>
        </Box>
    )
}
