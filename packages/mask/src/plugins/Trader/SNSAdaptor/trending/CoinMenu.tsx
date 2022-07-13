import { CheckCircleIcon } from '@masknet/icons'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { TokenType } from '@masknet/web3-shared-base'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Divider, MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import { groupBy, toPairs } from 'lodash-unified'
import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import type { Coin } from '../../types'
import { CoinIcon } from './components'

const useStyles = makeStyles()((theme) => ({
    coinMenu: {
        maxHeight: 600,
        maxWidth: 400,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    groupName: {
        height: 18,
        fontSize: 14,
        fontWeight: 'bold',
        padding: theme.spacing(0, 2),
    },
    menuItem: {
        overflow: 'hidden',
        alignItems: 'stretch',
        paddingRight: 0,
        height: 36,
    },
    itemText: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-around',
        gap: theme.spacing(1),
        paddingRight: theme.spacing(1),
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
    checkedIcon: {
        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        fontSize: 20,
        color: theme.palette.maskColor.primary,
    },
}))

export interface CoinMenuOption {
    coin: Coin
    value: string
}
interface TokenMenuListProps {
    options: CoinMenuOption[]
    type?: TokenType
    value?: CoinMenuOption['value']
    onSelect(type: TokenType, value: CoinMenuOption['value']): void
}

const TokenMenuList: FC<TokenMenuListProps> = ({ options, type, value, onSelect }) => {
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <>
            {options.map((x) => {
                const selected = value === x.value && type === x.coin.type
                return (
                    <MenuItem
                        className={classes.menuItem}
                        selected={selected}
                        key={`${x.coin.type}/${x.value}`}
                        onClick={() => onSelect(x.coin.type, x.value)}>
                        <CoinIcon
                            type={x.coin.type}
                            address={x.coin.address}
                            name={x.coin.name}
                            logoUrl={x.coin.image_url}
                            size={20}
                        />
                        <Typography className={classes.symbol}>{x.coin.market_cap_rank}</Typography>
                        <Stack className={classes.itemText}>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                flexGrow={1}
                                overflow="hidden"
                                textOverflow="ellipsis">
                                <span className={classes.name}>{x.coin.name}</span>
                                <span className={classes.symbol}>({x.coin.symbol})</span>
                            </Typography>
                            {selected ? (
                                <CheckCircleIcon className={classes.checkedIcon} />
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
    options: CoinMenuOption[]
    type?: TokenType
    value?: CoinMenuOption['value']
    onChange?: (type: TokenType, value: CoinMenuOption['value']) => void
    onClose?: () => void
}

const menuGroupNameMap: Record<TokenType, string> = {
    [TokenType.Fungible]: 'Token',
    [TokenType.NonFungible]: 'NFT',
}

export const CoinMenu: FC<PropsWithChildren<CoinMenuProps>> = ({
    open,
    options,
    anchorEl,
    type,
    value,
    onChange,
    onClose,
}) => {
    const { classes } = useStyles()
    const onSelect = useCallback(
        (type: TokenType, value: CoinMenuOption['value']) => {
            onChange?.(type, value)
            onClose?.()
        },
        [onChange, onClose],
    )

    const menuItems = useMemo(() => {
        const groups: Array<[type: TokenType, options: CoinMenuOption[]]> = toPairs(
            groupBy(options, (x) => x.coin.type),
        ).map(([type, options]) => [type as TokenType, options])

        if (groups.length > 1) {
            return groups.map(([type, groupOptions]) => (
                <React.Fragment key={type}>
                    <Typography className={classes.groupName}>{menuGroupNameMap[type]}</Typography>
                    <Divider className={classes.divider} />
                    <TokenMenuList options={groupOptions} type={type} value={value} onSelect={onSelect} />
                </React.Fragment>
            ))
        }
        return <TokenMenuList type={type} options={options} value={value} onSelect={onSelect} />
    }, [options, type, value, onSelect])

    return (
        <ShadowRootMenu open={open} onClose={onClose} anchorEl={anchorEl} PaperProps={{ className: classes.coinMenu }}>
            {menuItems}
        </ShadowRootMenu>
    )
}
