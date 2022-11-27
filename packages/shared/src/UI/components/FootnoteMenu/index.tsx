import { Typography, MenuItem, Link, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMenuConfig } from '@masknet/shared'
import {
    RadioButtonUnchecked as RadioButtonUncheckedIcon,
    ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    title: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10,
        color: theme.palette.maskColor.dark,
    },
    icon: {
        color: theme.palette.maskColor.dark,
    },
}))

export interface FootnoteMenuOption {
    name: React.ReactNode
    value: string | number
    disabled?: boolean
}

export interface FootnoteMenuProps {
    options: FootnoteMenuOption[]
    selectedIndex?: number
    children?: React.ReactNode
    hideArrowDropDownIcon?: boolean
    onChange?: (option: FootnoteMenuOption) => void
}

export function FootnoteMenu(props: FootnoteMenuProps) {
    const { children, options, selectedIndex = -1, onChange, hideArrowDropDownIcon = false } = props

    const { classes, theme } = useStyles()
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option)
    }
    const [menu, openMenu] = useMenuConfig(
        options.map((x, i) => (
            <MenuItem disabled={x.disabled} key={x.value} onClick={() => onSelect(x)}>
                <Stack direction="row" justifyContent="space-around" gap={1} alignItems="center" width="100%">
                    <Stack flexGrow={1} color={theme.palette.maskColor.main}>
                        {x.name}
                    </Stack>
                    {selectedIndex === i ? (
                        <Icons.CheckCircle
                            size={20}
                            style={{
                                color: theme.palette.maskColor.primary,
                                boxShadow: '0px 4px 10px rgba(28, 104, 243, 0.2)',
                            }}
                        />
                    ) : (
                        <RadioButtonUncheckedIcon
                            style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                        />
                    )}
                </Stack>
            </MenuItem>
        )),
        {
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            PaperProps: {
                style: { background: theme.palette.maskColor.bottom },
            },
        },
    )

    return (
        <>
            <Link className={classes.link} color="inherit" underline="none" onClick={openMenu}>
                <Typography className={classes.title} variant="subtitle2">
                    {options[selectedIndex]?.name}
                    {hideArrowDropDownIcon ? null : (
                        <ArrowDropDownIcon style={{ fontSize: 16, cursor: 'pointer' }} className={classes.icon} />
                    )}
                </Typography>
                {children}
            </Link>
            {menu}
        </>
    )
}
