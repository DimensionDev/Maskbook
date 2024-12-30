import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'
import { CheckBoxIndicator, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { type NonFungibleCollection } from '@masknet/web3-shared-base'
import { Avatar, Link, ListItem, Typography, type ListItemProps } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    listItem: {
        padding: '14px 12px',
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
            cursor: 'pointer',
        },
    },
    logo: {
        borderRadius: '100%',
        overflow: 'hidden',
        flexShrink: 0,
        width: 36,
        height: 36,
        marginRight: 8,
        boxShadow: theme.palette.mode === 'light' ? '0 6px 12px rgba(0,0,0,0.2)' : undefined,
    },
    contractName: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginLeft: theme.spacing(0.5),
        color: 'inherit',
    },
    contractSymbol: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    tail: {
        marginLeft: 'auto',
    },
    disabled: {
        cursor: 'not-allowed',
    },
}))

interface ContractItemProps extends Omit<ListItemProps, 'onSelect'> {
    pluginID: NetworkPluginID
    collection: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    enabledSelect?: boolean
    selected?: boolean
    disabled?: boolean
    onSelect?(collection: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>): void
}

export const ContractItem = memo(function ContractItem({
    pluginID,
    className,
    collection,
    enabledSelect,
    selected,
    disabled,
    onSelect,
    ...rest
}: ContractItemProps) {
    const { classes, cx, theme } = useStyles()
    const Utils = useWeb3Utils(pluginID)

    return (
        <ListItem className={cx(classes.listItem, className)} onClick={() => onSelect?.(collection)} {...rest}>
            <Avatar className={classes.logo} src={collection.iconURL || ''}>
                <Icons.MaskAvatar size={36} />
            </Avatar>
            <div>
                <Typography className={classes.contractSymbol}>{collection.symbol}</Typography>
                <Typography className={classes.contractName}>
                    {collection.name}
                    <Link
                        href={Utils.explorerResolver.nonFungibleTokenCollectionLink(
                            collection.chainId,
                            collection.address!,
                        )}
                        className={classes.linkIcon}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}>
                        <Icons.LinkOut size={16} />
                    </Link>
                </Typography>
            </div>
            {enabledSelect ?
                <div className={classes.tail}>
                    <CheckBoxIndicator
                        className={disabled ? classes.disabled : undefined}
                        color={theme.palette.maskColor.primary}
                        checked={selected}
                        uncheckedColor={theme.palette.maskColor.secondaryLine}
                    />
                </div>
            : collection.balance ?
                <Typography className={classes.tail}>{collection.balance}</Typography>
            :   null}
        </ListItem>
    )
})
