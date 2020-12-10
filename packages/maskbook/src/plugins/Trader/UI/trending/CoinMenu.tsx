import { useState } from 'react'
import { makeStyles, createStyles, Typography, MenuItem } from '@material-ui/core'
import { InjectedMenu } from '../../../../components/shared/injectedMenu'
import type { Coin } from '../../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        name: {},
        symbol: {
            color: theme.palette.text.secondary,
            fontSize: 12,
            marginLeft: theme.spacing(0.5),
        },
    }),
)

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

    const classes = useStyles()
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
            <InjectedMenu open={!!anchorEl} onClose={onClose} anchorEl={anchorEl}>
                {options.map((x, i) => (
                    <MenuItem selected={selectedIndex === i} key={x.value} onClick={() => onSelect(x)}>
                        <Typography>
                            <span className={classes.name}>{x.coin.name}</span>
                            <span className={classes.symbol}>({x.coin.symbol})</span>
                        </Typography>
                    </MenuItem>
                ))}
            </InjectedMenu>
        </>
    )
}
