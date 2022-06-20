import { CheckCircleIcon } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react'
import type { Coin } from '../../types'

const useStyles = makeStyles()((theme) => ({
    groupName: {
        borderBottom: `1px solid ${theme.palette.divider}`,
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
    value?: CoinMenuOption['value']
    onSelect(value: CoinMenuOption['value']): void
}

const TokenMenuList: FC<TokenMenuListProps> = ({ options, value, onSelect }) => {
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <>
            {options.map((x) => (
                <MenuItem selected={value === x.value} key={x.value} onClick={() => onSelect(x.value)}>
                    {x.coin.address ? (
                        <TokenIcon pluginID={NetworkPluginID.PLUGIN_EVM} address={x.coin.address} />
                    ) : null}
                    <Typography className={classes.symbol}>{x.coin.market_cap_rank}</Typography>
                    <Typography className={classes.symbol}>({x.coin.symbol})</Typography>
                    <Stack direction="row" justifyContent="space-around" gap={1} alignItems="center" width="100%">
                        <Typography fontSize={14} fontWeight={700} flexGrow={1}>
                            <span>{x.coin.name}</span>
                            <span className={classes.symbol}>({x.coin.symbol})</span>
                        </Typography>
                        {value === x.value ? (
                            <CheckCircleIcon style={{ fontSize: 20, color: theme.palette.maskColor.primary }} />
                        ) : (
                            <RadioButtonUncheckedIcon
                                style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                            />
                        )}
                    </Stack>
                </MenuItem>
            ))}
        </>
    )
}

export interface CoinMenuProps {
    options: CoinMenuOption[]
    groups?: Array<{ name: string; options: CoinMenuOption[] }>
    value?: CoinMenuOption['value']
    onChange?: (value: CoinMenuOption['value']) => void
}

export const CoinMenu: FC<PropsWithChildren<CoinMenuProps>> = ({ options, groups, value, children, onChange }) => {
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const onOpen = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
    const onClose = useCallback(() => setAnchorEl(null), [])
    const onSelect = useCallback(
        (value: CoinMenuOption['value']) => {
            onChange?.(value)
            onClose()
        },
        [onChange],
    )

    const menuItems = useMemo(() => {
        if (groups?.length) {
            return groups.map((group) => (
                <>
                    <Typography className={classes.groupName}>{group.name}</Typography>
                    <TokenMenuList options={group.options} value={value} onSelect={onSelect} />
                </>
            ))
        }
        return <TokenMenuList options={options} value={value} onSelect={onSelect} />
    }, [groups, value, onSelect])

    return (
        <>
            <div onClick={onOpen}>{children}</div>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                PaperProps={{ style: { maxHeight: 192 } }}>
                {menuItems}
            </ShadowRootMenu>
        </>
    )
}
