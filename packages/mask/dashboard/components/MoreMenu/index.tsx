import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Popover } from '@mui/material'
import { memo, useState, type ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        borderRadius: 24,
        background: theme.vars.palette.maskColor.bottom,
        boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
        ...theme.applyStyles('dark', {
            boxShadow: '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
        }),
    },
}))

interface Props extends GeneratedIconProps {
    children?: ReactNode | ((props: { close: () => void }) => ReactNode)
}

export const MoreMenu = memo<Props>(function MoreMenu({ children, ...rest }) {
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    return (
        <>
            <Icons.More size={24} {...rest} onClick={(e) => setAnchorEl(e.currentTarget)} />
            <Popover
                disableScrollLock
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                classes={{ paper: classes.paper }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                {typeof children === 'function' ? children({ close: () => setAnchorEl(null) }) : children}
            </Popover>
        </>
    )
})
