import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        flex: 1,
        minHeight: 300,
        padding: theme.spacing(2),
        overflow: 'auto',
    },
}))

export interface ProviderTabPanelProps {
    children: ReactNode
}

export function ProviderTabPanel(props: ProviderTabPanelProps) {
    const { classes } = useStyles()
    return <Box className={classes.root}>{props.children}</Box>
}
