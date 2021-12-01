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
    icon: {
        color: getMaskColor(theme).textPrimary,
    },
    iconContainer: {
        display: 'inherit',
    },
    tooltip: {
        height: '100%',
        borderRadius: 0,
        color: getMaskColor(theme).textPrimary,
        backgroundColor: getMaskColor(theme).twitterBackgroundHover,
        textAlign: 'initial',
        opacity: 0.9,
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
        t('plugin_profile_binding_rule3'),
        t('plugin_profile_binding_rule4', { suffix: `".eth"` }),
    ]

    const tooltipRender = (
        <div>
            <div style={{ fontSize: '0.8rem' }}>{t('plugin_profile_binding_rules_title')}</div>
            {rulesTipMap.map((item) => {
                return (
                    <div>
                        {item}
                        <br />
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
                                    title={tooltipRender}
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    classes={{ tooltip: classes.tooltip }}>
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
