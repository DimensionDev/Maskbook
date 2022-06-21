import { Typography, MenuItem, Link, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMenu } from '../../../../utils'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useTheme } from '@mui/system'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { CheckCircleIcon } from '@masknet/icons'

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
        color: theme.palette.text.secondary,
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
    onChange?: (option: FootnoteMenuOption) => void
}

export function FootnoteMenu(props: FootnoteMenuProps) {
    const { children, options, selectedIndex = -1, onChange } = props
    const theme = useTheme()

    const { classes } = useStyles()
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option)
    }
    const [menu, openMenu] = useMenu(
        options.map((x, i) => (
            <MenuItem disabled={x.disabled} key={x.value} onClick={() => onSelect(x)}>
                <Stack direction="row" justifyContent="space-around" gap={1} alignItems="center" width="100%">
                    <Stack flexGrow={1}>{x.name}</Stack>
                    {selectedIndex === i ? (
                        <CheckCircleIcon
                            style={{
                                fontSize: 20,
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
                    <ArrowDropDownIcon style={{ fontSize: 16, color: theme.palette.text.primary, cursor: 'pointer' }} />
                </Typography>
                {children}
            </Link>
            {menu}
        </>
    )
}
