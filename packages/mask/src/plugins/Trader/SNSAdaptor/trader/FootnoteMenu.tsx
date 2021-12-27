import { Typography, MenuItem, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMenu } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    title: {
        fontSize: 10,
        color: theme.palette.text.secondary,
    },
}))

export interface FootnoteMenuOption {
    name: React.ReactNode
    value: number
}

export interface FootnoteMenuProps {
    options: FootnoteMenuOption[]
    selectedIndex?: number
    children?: React.ReactNode
    onChange?: (option: FootnoteMenuOption) => void
}

export function FootnoteMenu(props: FootnoteMenuProps) {
    const { children, options, selectedIndex = -1, onChange } = props

    const { classes } = useStyles()
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option)
    }
    const [menu, openMenu] = useMenu(
        options.map((x, i) => (
            <MenuItem selected={selectedIndex === i} key={x.value} onClick={() => onSelect(x)}>
                {x.name}
            </MenuItem>
        )),
        false,
        {
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'left',
            },
            transformOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            },
        },
    )

    return (
        <>
            <Link className={classes.link} color="inherit" underline="none" onClick={openMenu}>
                <Typography className={classes.title} variant="subtitle2">
                    {options[selectedIndex]?.name}
                </Typography>
                {children}
            </Link>
            {menu}
        </>
    )
}
