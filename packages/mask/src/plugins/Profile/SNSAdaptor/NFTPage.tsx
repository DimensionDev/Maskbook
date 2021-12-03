import { getMaskColor, makeStyles, useStylesExtends } from '@masknet/theme'
import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    ChainId,
    EthereumNameType,
    useEthereumAddress,
} from '@masknet/web3-shared-evm'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Link, Typography, CircularProgress } from '@mui/material'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { ShadowRootTooltip, useI18N } from '../../../utils'
import { useUserOwnerAddress } from '../../Avatar/hooks/useUserOwnerAddress'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    note: {
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

    tooltip: {
        height: '100%',
        borderRadius: theme.spacing(1),
        color: getMaskColor(theme).textPrimary,
        backgroundColor: getMaskColor(theme).tooltipBackground,
        textAlign: 'initial',
        padding: theme.spacing(2),
        maxWidth: '428px',
        boxShadow: `0px 0px 20px rgba(28, 104, 243, 0.05)`,
    },
    tipTitle: {
        fontSize: '18px',
        fontWeight: 400,
        lineHeight: '24px',
        marginBottom: '10px',
    },
    tipContent: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,
    },
    tipArrows: {
        width: '45px',
        height: '45px',
        color: getMaskColor(theme).tooltipBackground,
        transform: 'translate3d( 226px, 21px, 0px) !important',
        ':before': {
            transformOrigin: 'top center',
            transform: 'rotate(45deg) translate(10px, 0px)',
            borderRadius: '3px',
            boxShadow: `0px 0px 20px rgba(28, 104, 243, 0.05)`,
        },
    },
    tipPopper: {
        transform: 'translate3d( 320px, -49px, 0px) !important',
    },
}))

interface NFTPageProps extends withClasses<'text' | 'button'> {}

export function NFTPage(props: NFTPageProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const identity = useCurrentVisitingIdentity()
    const { loading: loadingENS, value } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )
    const { type, name, address } = value ?? {}
    const { loading: loadingWalletGun, value: walletAddressGun } = useUserOwnerAddress(identity.identifier.userId)

    const rulesTipMap = [
        t('plugin_profile_binding_rule1'),
        t('plugin_profile_binding_rule2'),
        t('plugin_profile_binding_rule3', { suffix: `".eth"` }),
        t('plugin_profile_binding_rule4'),
    ]

    const tooltipRender = (
        <div>
            <div className={classes.tipTitle}>{t('plugin_profile_binding_rules_title')}</div>
            {rulesTipMap.map((item, index) => {
                return (
                    <div key={index} className={classes.tipContent}>
                        {item}
                    </div>
                )
            })}
        </div>
    )

    if (!address && !walletAddressGun)
        return (
            <div className={classes.root}>
                <Box className={classes.text} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                </Box>
            </div>
        )
    return (
        <div className={classes.root}>
            {loadingWalletGun || loadingENS ? (
                <Box className={classes.note} display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box
                        className={classes.note}
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                        flexWrap="wrap">
                        <Box display="flex" alignItems="center">
                            <Typography color="textPrimary" component="span">
                                {t('plugin_profile_current_display_of', { type: type })}
                                <Link
                                    href={resolveAddressLinkOnExplorer(
                                        ChainId.Mainnet,
                                        (address?.length === 0 ? walletAddressGun : address) ?? '',
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {type === EthereumNameType.DEFAULT
                                        ? formatEthereumAddress(
                                              (address?.length === 0 ? walletAddressGun : address) ?? '',
                                              4,
                                          )
                                        : name}
                                </Link>
                            </Typography>
                            <div className={classes.iconContainer}>
                                <ShadowRootTooltip
                                    arrow
                                    title={tooltipRender}
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    classes={{
                                        tooltip: classes.tooltip,
                                        arrow: classes.tipArrows,
                                        popper: classes.tipPopper,
                                    }}
                                    placement="top">
                                    <InfoOutlinedIcon
                                        fontSize="small"
                                        className={classes.icon}
                                        sx={{ lineHeight: 1, marginLeft: 0.5, cursor: 'pointer' }}
                                    />
                                </ShadowRootTooltip>
                            </div>
                        </Box>
                    </Box>
                    <CollectionList address={(address?.length === 0 ? walletAddressGun : address) ?? ''} />
                </>
            )}
        </div>
    )
}
