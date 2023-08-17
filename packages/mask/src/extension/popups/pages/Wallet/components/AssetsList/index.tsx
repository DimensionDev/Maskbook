import { FormattedCurrency, NetworkIcon, ProgressiveText, TokenIcon } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { useFungibleTokenBalance, useNetworks, useWallet } from '@masknet/web3-hooks-base'
import { formatCurrency, isGte, isLessThan, isZero, type FungibleAsset } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, List, ListItem, ListItemText, Skeleton, Typography, type ListItemProps } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { formatTokenBalance } from '../../../../../../utils/index.js'
import { useAssetExpand, useWalletAssets } from '../../hooks/index.js'
import { MoreBar } from './MoreBar.js'

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
        maxWidth: '50%',
        overflow: 'auto',
    },
    name: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
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
interface AssetItemProps extends ListItemProps {
    asset: Asset
    onItemClick(asset: Asset): void
}

const AssetItem = memo(function AssetItem({ asset, onItemClick, ...rest }: AssetItemProps) {
    const { classes, cx } = useStyles()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const network = networks.find((x) => x.chainId === asset.chainId)
    const providerURL = network?.isCustomized ? network.rpcUrl : undefined
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    // Debank might not provide asset from current custom network
    const tryRpc = (!asset.balance || isZero(asset.balance)) && network?.isCustomized && seen
    const { data: rpcBalance, isLoading } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        asset.address,
        { chainId: asset.chainId, providerURL },
        tryRpc,
    )
    const balance = useMemo(() => {
        if (tryRpc) {
            return {
                pending: isLoading,
                value: isLoading ? undefined : formatTokenBalance(rpcBalance, asset.decimals),
            }
        }
        return {
            pending: false,
            value: formatTokenBalance(asset.balance, asset.decimals),
        }
    }, [tryRpc, rpcBalance, asset.balance, asset.decimals, isLoading])
    return (
        <ListItem
            key={`${asset.chainId}.${asset.address}`}
            {...rest}
            ref={ref}
            onClick={() => onItemClick(asset)}
            className={cx(classes.item, rest.className)}
            secondaryAction={
                <Typography className={classes.value}>
                    <FormattedCurrency
                        value={asset.value?.usd || 0}
                        formatter={formatCurrency}
                        options={{ onlyRemainTwoOrZeroDecimal: true }}
                    />
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
                <NetworkIcon
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.badgeIcon}
                    chainId={asset.chainId}
                    size={16}
                    icon={network?.iconUrl}
                    preferName={network?.isCustomized}
                />
            </Box>
            <ListItemText
                className={classes.text}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                    <ProgressiveText className={classes.balance} loading={balance.pending} skeletonWidth={60}>
                        {balance.value}
                        {asset.symbol}
                    </ProgressiveText>
                }>
                <TextOverflowTooltip title={asset.name}>
                    <Typography className={classes.name}>{asset.name}</Typography>
                </TextOverflowTooltip>
            </ListItemText>
        </ListItem>
    )
})

export const AssetsList = memo(function AssetsList() {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { data: assets, isLoading } = useWalletAssets()
    const [assetsIsExpand, setAssetsIsExpand] = useAssetExpand()
    const onItemClick = useCallback((asset: Asset) => {
        navigate(urlcat(PopupRoutes.TokenDetail, { chainId: asset.chainId, address: asset.address }))
    }, [])
    const onSwitch = useCallback(() => setAssetsIsExpand((x) => !x), [])
    const isSmartPay = !!useWallet(NetworkPluginID.PLUGIN_EVM)?.owner
    const filteredAssets = useMemo(() => {
        if (isSmartPay) return assets.filter((x) => x.chainId === ChainId.Matic)
        return assets
    }, [assets, isSmartPay])

    const hasLowValueToken = useMemo(() => {
        return !!filteredAssets.find((x) => {
            if (isNativeTokenAddress(x.address)) return false
            return x.value?.usd ? isLessThan(x.value.usd, 1) : false
        })
    }, [filteredAssets])
    const list = filteredAssets.filter(
        (asset) => assetsIsExpand || isNativeTokenAddress(asset.address) || isGte(asset.value?.usd ?? 0, 1),
    )
    return (
        <>
            {isLoading ? (
                <AssetsListSkeleton />
            ) : (
                <List dense className={classes.list}>
                    {list.map((asset) => (
                        <AssetItem key={`${asset.chainId}.${asset.address}`} asset={asset} onItemClick={onItemClick} />
                    ))}
                </List>
            )}
            {hasLowValueToken ? (
                <MoreBar isExpand={assetsIsExpand} onClick={onSwitch} className={classes.more} />
            ) : null}
        </>
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
