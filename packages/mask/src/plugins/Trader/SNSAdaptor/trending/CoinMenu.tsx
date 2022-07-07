import { useState } from 'react'
import { Typography, MenuItem, Stack } from '@mui/material'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import type { Coin } from '../../types'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useTheme } from '@mui/system'
import { CheckCircleIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    symbol: {
        marginLeft: theme.spacing(0.5),
    },
}))

export interface CoinMenuOption {
    coin: Coin
    value: string
}

export interface CoinMenuProps {
    options: CoinMenuOption[]
    selectedIndex?: number
    onChange?: (option: CoinMenuOption) => void
    children?: React.ReactNode
}

export function CoinMenu(props: CoinMenuProps) {
    const { options, selectedIndex = -1, children, onChange } = props

    const { classes } = useStyles()
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const onOpen = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
    const onSelect = (option: CoinMenuOption) => {
        onChange?.(option)
        onClose()
    }
    const onClose = () => setAnchorEl(null)

    return (
        <>
            <div onClick={onOpen}>{children}</div>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{ style: { maxHeight: 192 } }}>
                {options.map((x, i) => (
                    <MenuItem selected={selectedIndex === i} key={x.value} onClick={() => onSelect(x)}>
                        <Stack direction="row" justifyContent="space-around" gap={1} alignItems="center" width="100%">
                            <Typography fontSize={14} fontWeight={700} flexGrow={1}>
                                <span>{x.coin.name}</span>
                                <span className={classes.symbol}>({x.coin.symbol})</span>
                            </Typography>
                            {selectedIndex === i ? (
                                <CheckCircleIcon style={{ fontSize: 20, color: theme.palette.maskColor.primary }} />
                            ) : (
                                <RadioButtonUncheckedIcon
                                    style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                                />
                            )}
                        </Stack>
                    </MenuItem>
                ))}
            </ShadowRootMenu>
        </>
    )
}
