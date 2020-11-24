import { useState } from 'react'
import { makeStyles, createStyles, Typography, MenuItem, Link } from '@material-ui/core'
import { InjectedMenu } from '../../../../components/shared/injectedMenu'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            fontSize: 10,
            color: theme.palette.text.secondary,
            cursor: 'pointer',
        },
    }),
)

export interface FootnoteMenuOption {
    name: React.ReactNode
    value: number
}

export interface FootnoteMenuProps {
    options: FootnoteMenuOption[]
    selectedIndex?: number
    onChange?: (option: FootnoteMenuOption) => void
}

export function FootnoteMenu(props: FootnoteMenuProps) {
    const { options, selectedIndex = -1, onChange } = props

    const classes = useStyles()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const onOpen = (event: React.MouseEvent<HTMLAnchorElement>) => setAnchorEl(event.currentTarget)
    const onSelect = (option: FootnoteMenuOption) => {
        onChange?.(option)
        onClose()
    }
    const onClose = () => setAnchorEl(null)

    return (
        <>
            <Link color="inherit" underline="none" onClick={onOpen}>
                <Typography className={classes.title} variant="subtitle2">
                    {options[selectedIndex].name}
                </Typography>
            </Link>
            <InjectedMenu open={!!anchorEl} onClose={onClose} anchorEl={anchorEl}>
                {options.map((x, i) => (
                    <MenuItem selected={selectedIndex === i} key={x.value} onClick={() => onSelect(x)}>
                        {x.name}
                    </MenuItem>
                ))}
            </InjectedMenu>
        </>
    )
}
