import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { groupBy, toPairs, isEqual } from 'lodash-es'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenResult, FungibleTokenResult } from '@masknet/web3-shared-base'
import { TokenIcon } from '@masknet/shared'
import { SearchResultType } from '@masknet/web3-shared-base'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material'
import { Divider, MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import type { Coin } from '../../types/index.js'

const useStyles = makeStyles()((theme) => ({
    coinMenu: {
        maxHeight: 600,
        maxWidth: 400,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& > ul': {
            paddingRight: '0 !important',
            width: '100% !important',
        },
    },
    groupName: {
        height: 18,
        fontWeight: 'bold',
        padding: theme.spacing(0, 2),
    },
    menuItem: {
        overflow: 'hidden',
        alignItems: 'stretch',
        height: 36,
    },
    itemText: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-around',
        gap: theme.spacing(1),
        alignItems: 'center',
        overflow: 'hidden',
    },
    divider: {
        margin: theme.spacing(1, 0),
    },
    name: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    symbol: {
        marginLeft: theme.spacing(0.5),
    },
    coinIcon: {
        fontSize: 10,
    },
    checkedIcon: {
        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        color: theme.palette.maskColor.primary,
    },
}))

export interface CoinMenuOption {
    coin: Coin
    value: string
}
interface TokenMenuListProps {
    options: Array<
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >
    result:
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    onSelect(
        value:
            | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
            | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    ): void
}

const TokenMenuList: FC<TokenMenuListProps> = ({ options, result, onSelect }) => {
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <>
            {options.map((x, i) => {
                const selected = isEqual(x, result)
                return (
                    <MenuItem className={classes.menuItem} selected={selected} key={i} onClick={() => onSelect(x)}>
                        {x.iconURL ? (
                            <TokenIcon
                                className={classes.coinIcon}
                                logoURL={x.iconURL}
                                address={x.address || ''}
                                size={20}
                            />
                        ) : null}
                        <Stack className={classes.itemText}>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                flexGrow={1}
                                overflow="hidden"
                                textOverflow="ellipsis">
                                <span className={classes.name}>{x.name}</span>
                                {x.symbol ? <span className={classes.symbol}>({x.symbol})</span> : null}
                            </Typography>
                            {selected ? (
                                <Icons.CheckCircle size={20} className={classes.checkedIcon} />
                            ) : (
                                <RadioButtonUncheckedIcon
                                    style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                                />
                            )}
                        </Stack>
                    </MenuItem>
                )
            })}
        </>
    )
}

export interface CoinMenuProps {
    open: boolean
    anchorEl: HTMLElement | null
    optionList: Array<
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >
    result:
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    onChange?: (
        a:
            | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
            | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    ) => void
    onClose?: () => void
}

const menuGroupNameMap: Record<SearchResultType.FungibleToken | SearchResultType.NonFungibleToken, string> = {
    [SearchResultType.FungibleToken]: 'Token',
    [SearchResultType.NonFungibleToken]: 'NFT',
}

export const CoinMenu: FC<PropsWithChildren<CoinMenuProps>> = ({
    open,
    result,
    optionList,
    anchorEl,
    onChange,
    onClose,
}) => {
    const { classes } = useStyles()
    const onSelect = useCallback(
        (
            value:
                | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
                | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
        ) => {
            onChange?.(value)
            onClose?.()
        },
        [onChange, onClose],
    )

    const menuItems = useMemo(() => {
        const groups: Array<
            [
                type: SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
                optionList: Array<
                    | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
                    | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
                >,
            ]
        > = toPairs(groupBy(optionList, (x) => x.type)).map(([type, optionList]) => [
            type as SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
            optionList,
        ])

        return groups.map(([type, groupOptions]) => (
            <div key={type}>
                <Typography className={classes.groupName}>{menuGroupNameMap[type]}</Typography>
                <Divider className={classes.divider} />
                <TokenMenuList options={groupOptions} result={result} onSelect={onSelect} />
            </div>
        ))
    }, [optionList, result, onSelect])

    return (
        <ShadowRootMenu open={open} onClose={onClose} anchorEl={anchorEl} PaperProps={{ className: classes.coinMenu }}>
            {menuItems}
        </ShadowRootMenu>
    )
}
