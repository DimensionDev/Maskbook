import { Icons } from '@masknet/icons'
import { NetworkIcon, ProgressiveText, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleTokenBalance, useWeb3Others } from '@masknet/web3-hooks-base'
import { isZero, type ReasonableNetwork } from '@masknet/web3-shared-base'
import {
    Box,
    Link,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    type ListItemProps,
    useForkRef,
} from '@mui/material'
import { memo, useEffect, useMemo, useRef } from 'react'
import { formatTokenBalance, useI18N } from '../../../../utils/index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
        item: {
            padding: theme.spacing(1, 1.5),
            boxSizing: 'border-box',
            borderRadius: 8,
            border: `1px solid ${theme.palette.maskColor.line}`,
            marginBottom: theme.spacing(1),
        },
        selected: {
            borderColor: theme.palette.maskColor.highlight,
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
            fontSize: 10,
        },
        listText: {
            margin: 0,
        },
        text: {
            fontSize: 16,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
        name: {
            fontSize: 14,
            color: theme.palette.maskColor.second,
            display: 'flex',
            alignItems: 'center',
        },
        balance: {
            fontSize: 16,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
        link: {
            color: theme.palette.maskColor.second,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
        },
    }
})

export interface TokenItemProps extends Omit<ListItemProps, 'onSelect'> {
    asset: Web3Helper.FungibleAssetAll
    network: ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>
    selected?: boolean
    onSelect?(asset: Web3Helper.FungibleAssetAll): void
}

export const TokenItem = memo(function TokenItem({
    className,
    asset,
    network,
    onSelect,
    selected,
    ...rest
}: TokenItemProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const Others = useWeb3Others()
    const explorerLink = useMemo(() => {
        return Others.explorerResolver.fungibleTokenLink(asset.chainId, asset.address)
    }, [asset.address, asset.chainId, Others.explorerResolver.fungibleTokenLink])

    const liRef = useRef<HTMLLIElement>(null)
    useEffect(() => {
        if (!selected) return
        liRef.current?.scrollIntoView()
    }, [selected, liRef.current])

    // #region Try getting balance through RPC.
    const providerURL = network?.isCustomized ? network.rpcUrl : undefined
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    // Debank might not provide asset from current custom network
    const tryRpc = (!asset.balance || isZero(asset.balance)) && network?.isCustomized && seen
    const { data: rpcBalance, isLoading } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        asset.address,
        { chainId: asset.chainId as ChainId, providerURL },
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
    // #endregion

    const forkedRef = useForkRef(liRef, ref)

    return (
        <ListItem
            secondaryAction={
                <ProgressiveText className={classes.balance} loading={balance.pending} skeletonWidth={50}>
                    {balance.value}
                </ProgressiveText>
            }
            className={cx(classes.item, className, selected ? classes.selected : null)}
            onClick={() => onSelect?.(asset)}
            ref={forkedRef}
            {...rest}>
            <ListItemIcon>
                {/* TODO utility TokenIcon with badge */}
                <Box position="relative">
                    <TokenIcon
                        className={classes.tokenIcon}
                        chainId={asset.chainId}
                        address={asset.address}
                        name={asset.name}
                        size={36}
                    />
                    <NetworkIcon
                        className={classes.badgeIcon}
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        chainId={network.chainId}
                        size={16}
                        network={network}
                    />
                </Box>
            </ListItemIcon>
            <ListItemText
                className={classes.listText}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                    <>
                        <Typography className={classes.name}>
                            {asset.name}
                            <Link
                                onClick={(event) => event.stopPropagation()}
                                href={explorerLink}
                                className={classes.link}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.LinkOut size={18} />
                            </Link>
                        </Typography>
                        {asset.isCustomToken ? <Typography>{t('added_by_user')}</Typography> : null}
                    </>
                }>
                <Typography className={classes.text}>{asset.symbol}</Typography>
            </ListItemText>
        </ListItem>
    )
})
