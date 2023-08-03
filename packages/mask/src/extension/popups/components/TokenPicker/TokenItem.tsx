import { Icons } from '@masknet/icons'
import { ImageIcon, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import { type NetworkDescriptor } from '@masknet/web3-shared-base'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { Box, ListItem, ListItemIcon, ListItemText, Typography, type ListItemProps, Link } from '@mui/material'
import { memo, useEffect, useMemo, useRef } from 'react'
import { formatTokenBalance } from '../../../../utils/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        item: {
            height: 60,
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
    network: NetworkDescriptor<ChainId, NetworkType> | undefined
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

    const Others = useWeb3Others()
    const explorerLink = useMemo(() => {
        return Others.explorerResolver.fungibleTokenLink(asset.chainId, asset.address)
    }, [asset.address, asset.chainId, Others.explorerResolver.fungibleTokenLink])

    const liRef = useRef<HTMLLIElement>(null)
    useEffect(() => {
        if (!selected) return
        liRef.current?.scrollIntoView()
    }, [selected, liRef.current])

    return (
        <ListItem
            secondaryAction={
                <Typography className={classes.balance}>{formatTokenBalance(asset.balance, asset.decimals)}</Typography>
            }
            className={cx(classes.item, className, selected ? classes.selected : null)}
            onClick={() => onSelect?.(asset)}
            ref={liRef}
            {...rest}>
            <ListItemIcon>
                {/* TODO utility TokenIcon with badge */}
                <Box position="relative">
                    <TokenIcon
                        className={classes.tokenIcon}
                        chainId={asset.chainId}
                        address={asset.address}
                        size={36}
                    />
                    <ImageIcon className={classes.badgeIcon} size={16} icon={network?.icon} />
                </Box>
            </ListItemIcon>
            <ListItemText
                className={classes.listText}
                secondary={
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
                }>
                <Typography className={classes.text}>{asset.symbol}</Typography>
            </ListItemText>
        </ListItem>
    )
})
