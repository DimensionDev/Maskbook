import { Icons } from '@masknet/icons'
import { FormattedBalance, ImageIcon, TokenIcon } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, type ActionButtonProps } from '@masknet/theme'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import {
    formatBalance,
    formatCurrency,
    isGte,
    isLessThan,
    type FungibleAsset,
    trimZero,
} from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, ListItemText, Skeleton, Typography } from '@mui/material'
import { isNaN, range } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import urlcat from 'urlcat'
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
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
        '&:not(:last-of-type)': {
            marginBottom: theme.spacing(1),
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
    },
    name: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    balance: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        fontWeight: 400,
    },
    value: {
        fontSize: 16,
        fontWeight: 700,
    },
    more: {
        display: 'inline-flex',
        width: 'auto',
        margin: theme.spacing(0, 'auto', 2),
    },
}))

type Asset = FungibleAsset<ChainId, SchemaType>

export const AssetsList = memo(function AssetsList() {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { assets, assetsLoading, setCurrentToken, assetsIsExpand, setAssetsIsExpand } = useContainer(WalletContext)
    const onItemClick = useCallback((asset: Asset) => {
        setCurrentToken(asset)
        navigate(urlcat(PopupRoutes.TokenDetail, { chainId: asset.chainId, address: asset.address }))
    }, [])
    const onSwitch = useCallback(() => setAssetsIsExpand((x) => !x), [])

    const hasLowValueToken = useMemo(() => {
        return !!assets.find((x) => {
            if (isNativeTokenAddress(x.address)) return false
            return x.value?.usd ? isLessThan(x.value.usd, 1) : false
        })
    }, [assets])
    return (
        <>
            {assetsLoading ? (
                <AssetsListSkeleton />
            ) : (
                <AssetsListUI isExpand={assetsIsExpand} assets={assets} onItemClick={onItemClick} />
            )}
            {hasLowValueToken ? (
                <MoreBar isExpand={assetsIsExpand} onClick={onSwitch} className={classes.more} />
            ) : null}
        </>
    )
})

export interface MoreBarProps extends ActionButtonProps {
    isExpand: boolean
}

export const MoreBar = memo<MoreBarProps>(function MoreBar({ isExpand, ...rest }) {
    const { t } = useI18N()
    if (isExpand)
        return (
            <ActionButton variant="roundedOutlined" {...rest}>
                <span>{t('popups_wallet_more_collapse')}</span>
                <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
            </ActionButton>
        )
    return (
        <ActionButton variant="roundedOutlined" {...rest}>
            <span>{t('popups_wallet_more_expand')}</span>
            <Icons.ArrowDrop />
        </ActionButton>
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
                                {trimZero(formatCurrency(asset.value?.usd || 0, 'USD', { onlyRemainTwoDecimal: true }))}
                            </Typography>
                        }>
                        <Box position="relative">
                            <TokenIcon
                                className={classes.tokenIcon}
                                chainId={asset.chainId}
                                address={asset.address}
                                name={asset.name}
                                logoURL={asset.logoURL}
                                size={36}
                            />
                            <ImageIcon className={classes.badgeIcon} size={16} icon={networkDescriptor?.icon} />
                        </Box>
                        <ListItemText
                            className={classes.text}
                            secondary={
                                <Typography className={classes.balance}>
                                    <FormattedBalance
                                        value={isNaN(asset.balance) ? 0 : asset.balance}
                                        decimals={isNaN(asset.decimals) ? 0 : asset.decimals}
                                        symbol={asset.symbol}
                                        significant={4}
                                        formatter={formatBalance}
                                    />
                                </Typography>
                            }>
                            <Typography className={classes.name}>{asset.name}</Typography>
                        </ListItemText>
                    </ListItem>
                )
            })}
        </List>
    )
})

const AssetsListSkeleton = memo(function AssetsListSkeleton() {
    const { classes } = useStyles()
    return (
        <List dense className={classes.list}>
            {range(10).map((i) => (
                <ListItem
                    key={i}
                    className={classes.item}
                    secondaryAction={
                        <Typography className={classes.value}>
                            <Skeleton width={60} />
                        </Typography>
                    }>
                    <Box position="relative">
                        <Skeleton variant="circular" className={classes.tokenIcon} />
                        <Skeleton variant="circular" width={16} height={16} className={classes.badgeIcon} />
                    </Box>
                    <ListItemText
                        className={classes.text}
                        secondary={
                            <Typography className={classes.balance}>
                                <Skeleton width={100} />
                            </Typography>
                        }>
                        <Skeleton className={classes.name} width={90} />
                    </ListItemText>
                </ListItem>
            ))}
        </List>
    )
})
