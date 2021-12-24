import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Link, Typography, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    ChainId,
    AddressName,
    AddressNameType,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'

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
    addressName: AddressName
}

export function AddressViewer({ addressName }: AddressViewerProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { type, label, resolvedAddress } = addressName

    const typeMap = {
        [AddressNameType.ADDRESS]: t('plugin_profile_address_name_address'),
        [AddressNameType.ENS]: t('plugin_profile_address_name_ens'),
        [AddressNameType.UNS]: t('plugin_profile_address_name_uns'),
        [AddressNameType.DNS]: t('plugin_profile_address_name_dns'),
        [AddressNameType.RSS3]: t('plugin_profile_address_name_rns'),
        [AddressNameType.GUN]: t('plugin_profile_address_name_address'),
        [AddressNameType.THE_GRAPH]: t('plugin_profile_address_name_address'),
    }

    const rulesTipMap = [
        t('plugin_profile_binding_rule1'),
        t('plugin_profile_binding_rule2'),
        t('plugin_profile_binding_rule3'),
        t('plugin_profile_binding_rule4'),
    ]

    const tooltipRender = (
        <div style={{ textAlign: 'left' }}>
            <Typography variant="body2">{t('plugin_profile_binding_rules_title')}</Typography>
            <ul className={classes.tipList}>
                {rulesTipMap.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    )

    if (!resolvedAddress) return null

    return (
        <Box className={classes.root} display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
            <Box display="flex" alignItems="center">
                <Typography color="textPrimary" component="span">
                    {t('plugin_profile_current_display_of', { type: typeMap[type] })}
                    <Link
                        href={resolveAddressLinkOnExplorer(ChainId.Mainnet, resolvedAddress)}
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
