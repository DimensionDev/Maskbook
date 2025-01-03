import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { ProgressiveText, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleTokenBalance, useWeb3Utils } from '@masknet/web3-hooks-base'
import { debank } from '@masknet/web3-providers/helpers'
import { type ReasonableNetwork } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Link, ListItem, ListItemIcon, ListItemText, Typography, useForkRef, type ListItemProps } from '@mui/material'
import { memo, useMemo, useRef } from 'react'
import { formatTokenBalance } from '../../../shared/index.js'

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
    asset: Web3Helper.FungibleAssetAll | Web3Helper.FungibleTokenAll
    network?: ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>
    selected?: boolean

    onSelect?(asset: Web3Helper.FungibleAssetAll | Web3Helper.FungibleTokenAll): void
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

    const Utils = useWeb3Utils()
    const explorerLink = useMemo(() => {
        return Utils.explorerResolver.fungibleTokenLink(asset.chainId, asset.address)
    }, [asset.address, asset.chainId, Utils.explorerResolver.fungibleTokenLink])

    const liRef = useRef<HTMLLIElement>(null)

    // #region Try getting balance through RPC.
    const providerURL = network?.isCustomized ? network.rpcUrl : undefined
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    // Debank might not provide asset from current custom network
    const supportedByDebank = debank.getDebankChain(asset.chainId)
    const tryRpc = (!supportedByDebank || !('balance' in asset)) && seen
    const { data: rpcBalance, isPending } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        asset.address,
        { chainId: asset.chainId as ChainId, providerURL },
        tryRpc,
    )
    const assetBalance = 'balance' in asset ? asset.balance : undefined
    const balance = useMemo(() => {
        if (tryRpc) {
            return {
                pending: isPending,
                value: isPending ? undefined : formatTokenBalance(rpcBalance, asset.decimals),
            }
        }
        return {
            pending: false,
            value: formatTokenBalance(assetBalance, asset.decimals),
        }
    }, [tryRpc, rpcBalance, assetBalance, asset.decimals, isPending])
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
                <TokenIcon
                    className={classes.tokenIcon}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    chainId={asset.chainId}
                    address={asset.address}
                    name={asset.name}
                    logoURL={asset.logoURL}
                    size={36}
                    badgeSize={16}
                />
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
                        {asset.isCustomToken ?
                            <Typography>
                                <Trans>Added by user</Trans>
                            </Typography>
                        :   null}
                    </>
                }>
                <Typography className={classes.text}>{asset.symbol}</Typography>
            </ListItemText>
        </ListItem>
    )
})
