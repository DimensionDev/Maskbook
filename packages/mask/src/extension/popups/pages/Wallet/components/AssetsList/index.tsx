import { Icons } from '@masknet/icons'
import { FormattedBalance, ImageIcon, TokenIcon } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import { formatBalance, formatCurrency, isGte, isLessThan, type FungibleAsset } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, type TypographyProps } from '@mui/material'
import { isNaN } from 'lodash-es'
import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../../utils/index.js'
import { WalletContext } from '../../hooks/useWalletContext.js'

const useStyles = makeStyles()((theme) => ({
    list: {
        backgroundColor: theme.palette.maskColor.bottom,
        padding: theme.spacing(2),
    },
    item: {
        padding: 14,
        cursor: 'pointer',
        marginBottom: theme.spacing(1),
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
    },
    tokenIcon: {
        width: 36,
        height: 36,
    },
    badgeIcon: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    text: {
        marginLeft: 14,
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    value: {
        fontSize: 16,
        fontWeight: 700,
    },
    more: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gas: 6,
        textAlign: 'center',
        padding: 12,
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.white,
    },
}))

type Asset = FungibleAsset<ChainId, SchemaType>

export const AssetsList = memo(function AssetsList() {
    const navigate = useNavigate()
    const { assets, setCurrentToken } = useContainer(WalletContext)
    const [isExpand, setIsExpand] = useState(false)
    const onItemClick = useCallback((asset: Asset) => {
        setCurrentToken(asset)
        navigate(`${PopupRoutes.TokenDetail}/${asset.address}`)
    }, [])
    const onSwitch = useCallback(() => setIsExpand((x) => !x), [])
    return (
        <>
            <AssetsListUI isExpand={isExpand} assets={assets} onItemClick={onItemClick} />
            <MoreBar isExpand={isExpand} assets={assets} onClick={onSwitch} />
        </>
    )
})

export interface MoreBarProps extends TypographyProps {
    isExpand: boolean
    assets: Asset[]
}

export const MoreBar = memo<MoreBarProps>(function MoreBar({ isExpand, assets, className, ...rest }) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    const hasLowValueToken = !!assets.find((x) =>
        !isNativeTokenAddress(x.address) && x.value?.usd ? isLessThan(x.value.usd, 1) : true,
    )
    if (!hasLowValueToken) return null
    if (isExpand)
        return (
            <Typography className={cx(classes.more, className)} {...rest}>
                <span>{t('popups_wallet_more_collapse')}</span>
                <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
            </Typography>
        )
    return (
        <Typography className={cx(classes.more, className)} {...rest}>
            <span>{t('popups_wallet_more_expand')}</span>
            <Icons.ArrowDrop />
        </Typography>
    )
})

export interface AssetsListUIProps {
    isExpand: boolean
    assets: Asset[]
    onItemClick: (token: Asset) => void
}

export const AssetsListUI = memo<AssetsListUIProps>(function AssetsListUI({ isExpand, assets, onItemClick }) {
    const { classes } = useStyles()
    const list = assets.filter(
        (asset) => isExpand || isNativeTokenAddress(asset.address) || isGte(asset.value?.usd ?? 0, 1),
    )
    const descriptors = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    return (
        <List dense className={classes.list}>
            {list.map((asset) => {
                const networkDescriptor = descriptors.find((x) => x.chainId === asset.chainId)
                return (
                    <ListItem
                        key={`${asset.chainId}.${asset.address}`}
                        className={classes.item}
                        onClick={() => onItemClick(asset)}
                        secondaryAction={
                            <Typography className={classes.value}>
                                {formatCurrency(asset.value?.usd || 0, 'USD', { onlyRemainTwoDecimal: true })}
                            </Typography>
                        }>
                        <ListItemIcon>
                            <Box position="relative">
                                <TokenIcon
                                    className={classes.tokenIcon}
                                    address={asset.address}
                                    name={asset.name}
                                    chainId={asset.chainId}
                                    logoURL={asset.logoURL}
                                    AvatarProps={{ sx: { width: 36, height: 36 } }}
                                />
                                <ImageIcon className={classes.badgeIcon} size={16} icon={networkDescriptor?.icon} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText
                            className={classes.text}
                            secondary={
                                <Typography>
                                    <FormattedBalance
                                        value={isNaN(asset.balance) ? 0 : asset.balance}
                                        decimals={isNaN(asset.decimals) ? 0 : asset.decimals}
                                        symbol={asset.symbol}
                                        significant={6}
                                        formatter={formatBalance}
                                    />
                                </Typography>
                            }>
                            {asset.name}
                        </ListItemText>
                    </ListItem>
                )
            })}
        </List>
    )
})
