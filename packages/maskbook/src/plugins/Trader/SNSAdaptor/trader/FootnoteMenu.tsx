import { useState } from 'react'
import { Typography, MenuItem, Link } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ShadowRootMenu } from '../../../../utils/shadow-root/ShadowRootComponents'

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const onOpen = (event: React.MouseEvent<HTMLAnchorElement>) => setAnchorEl(event.currentTarget)
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option)
        onClose()
    }
    const onClose = () => setAnchorEl(null)

    return (
        <>
            <Link className={classes.link} color="inherit" underline="none" onClick={onOpen}>
                <Typography className={classes.title} variant="subtitle2">
                    {options[selectedIndex]?.name}
                </Typography>
                {children}
            </Link>
            <ShadowRootMenu
                open={!!anchorEl}
                onClose={onClose}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}>
                {options.map((x, i) => (
                    <MenuItem selected={selectedIndex === i} key={x.value} onClick={() => onSelect(x)}>
                        {x.name}
                    </MenuItem>
                ))}
            </ShadowRootMenu>
        </>
    )
}
