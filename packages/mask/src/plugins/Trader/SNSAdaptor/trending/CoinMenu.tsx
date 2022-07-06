import { CheckCircleIcon } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { TrendingCoinType } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Divider, MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { groupBy, toPairs } from 'lodash-unified'
import type { Coin } from '../../types'

const useStyles = makeStyles()((theme) => ({
    groupName: {
        height: 18,
        fontSize: 14,
        fontWeight: 'bold',
        padding: theme.spacing(0, 2),
    },
    menuItem: {
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
}))

export interface CoinMenuOption {
    coin: Coin
    value: string
}
interface TokenMenuListProps {
    options: CoinMenuOption[]
    type?: TrendingCoinType
    value?: CoinMenuOption['value']
    onSelect(type: TrendingCoinType, value: CoinMenuOption['value']): void
}

interface CoinIconProps {
    type: TrendingCoinType
    address?: string
    logoUrl?: string
    name?: string
}
const CoinIcon: FC<CoinIconProps> = ({ type, address, logoUrl, name }) => {
    if (address && type === TrendingCoinType.Fungible)
        return <TokenIcon pluginID={NetworkPluginID.PLUGIN_EVM} address={address} name={name} />
    if (type === TrendingCoinType.NonFungible)
        return <TokenIcon pluginID={NetworkPluginID.PLUGIN_EVM} address="" logoURL={logoUrl} name={name} />
    return null
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
                        />
                        <Typography className={classes.symbol}>{x.coin.market_cap_rank}</Typography>
                        <Typography className={classes.symbol}>({x.coin.symbol})</Typography>
                        <Stack
                            direction="row"
                            flexGrow={1}
                            justifyContent="space-around"
                            gap={1}
                            alignItems="center"
                            overflow="hidden">
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
                                <CheckCircleIcon style={{ fontSize: 20, color: theme.palette.maskColor.primary }} />
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
    options: CoinMenuOption[]
    type?: TrendingCoinType
    value?: CoinMenuOption['value']
    onChange?: (type: TrendingCoinType, value: CoinMenuOption['value']) => void
}

const menuGroupNameMap: Record<TrendingCoinType, string> = {
    [TrendingCoinType.Fungible]: 'Token',
    [TrendingCoinType.NonFungible]: 'NFT',
}

export const CoinMenu: FC<PropsWithChildren<CoinMenuProps>> = ({ options, type, value, children, onChange }) => {
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const onOpen = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
    const onClose = useCallback(() => setAnchorEl(null), [])
    const onSelect = useCallback(
        (type: TrendingCoinType, value: CoinMenuOption['value']) => {
            onChange?.(type, value)
            onClose()
        },
        [onChange],
    )

    const menuItems = useMemo(() => {
        const groups: Array<[type: TrendingCoinType, options: CoinMenuOption[]]> = toPairs(
            groupBy(options, (x) => x.coin.type),
        ).map(([type, options]) => [Number.parseInt(type, 10), options])

        if (groups.length > 1) {
            return groups.map(([type, groupOptions]) => (
                <>
                    <Typography className={classes.groupName}>{menuGroupNameMap[type]}</Typography>
                    <Divider className={classes.divider} />
                    <TokenMenuList options={groupOptions} type={type} value={value} onSelect={onSelect} />
                </>
            ))
        }
        return <TokenMenuList type={type} options={options} value={value} onSelect={onSelect} />
    }, [type, value, onSelect])

    return (
        <>
            <div onClick={onOpen}>{children}</div>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                PaperProps={{ style: { maxHeight: 600, maxWidth: 400 } }}>
                {menuItems}
            </ShadowRootMenu>
        </>
    )
}
