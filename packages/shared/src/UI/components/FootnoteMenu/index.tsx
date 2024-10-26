import { Typography, MenuItem, Link, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMenuConfig } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
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
    },
    icon: {
        color: theme.palette.maskColor.main,
    },
}))

export interface FootnoteMenuOption {
    name: React.ReactNode
    value: Web3Helper.TokenResultAll
    disabled?: boolean
}

export interface FootnoteMenuProps extends withClasses<'title' | 'icon'> {
    options: FootnoteMenuOption[]
    selectedIndex?: number
    children?: React.ReactNode
    onChange?: (option: Web3Helper.TokenResultAll) => void
}

export function FootnoteMenu(props: FootnoteMenuProps) {
    const { children, options, selectedIndex = -1, onChange } = props

    const { classes, theme } = useStyles(undefined, { props })
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option.value)
    }
    const [menu, openMenu] = useMenuConfig(
        options.map((x, i) => (
            <MenuItem disabled={x.disabled} key={x.value.id} onClick={() => onSelect(x)}>
                <Stack direction="row" justifyContent="space-around" gap={1} alignItems="center" width="100%">
                    <Stack flexGrow={1} color={theme.palette.maskColor.main}>
                        {x.name}
                    </Stack>
                    {selectedIndex === i ?
                        <Icons.CheckCircle
                            size={20}
                            style={{
                                color: theme.palette.maskColor.primary,
                                boxShadow: '0px 4px 10px rgba(28, 104, 243, 0.2)',
                            }}
                        />
                    :   <RadioButtonUncheckedIcon
                            style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                        />
                    }
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
            <Link
                className={classes.link}
                color="inherit"
                underline="none"
                onClick={options.length > 1 ? openMenu : undefined}>
                <Typography className={classes.title} variant="subtitle2">
                    {options[selectedIndex]?.name}
                    {options.length > 1 ?
                        <ArrowDropDownIcon style={{ fontSize: 16, cursor: 'pointer' }} className={classes.icon} />
                    :   null}
                </Typography>
                {children}
            </Link>
            {options.length ? menu : null}
        </>
    )
}
