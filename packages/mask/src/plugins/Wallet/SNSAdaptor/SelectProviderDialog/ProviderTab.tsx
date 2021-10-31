import { useState, ReactNode } from 'react'
import { Box, Tab, Tabs } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ProviderTabPanel } from './ProviderTabPanel'

const useStyles = makeStyles()((theme) => ({
    root: {},
    tabs: {
        width: 80,
    },
    tab: {
        maxWidth: '100%',
        minWidth: 0,
    },
}))

export interface ProviderTabProps {
    tabs: {
        name: ReactNode
        icon: ReactNode
        panel: ReactNode
    }[]
}

export function ProviderTab(props: ProviderTabProps) {
    const { classes } = useStyles()
    const [value, setValue] = useState(0)
    return (
        <Box display="flex">
            <Tabs
                className={classes.tabs}
                orientation="vertical"
                variant="fullWidth"
                value={value}
                onChange={(_, newValue) => setValue(newValue)}>
                {props.tabs.map((x, i) => (
                    <Tab className={classes.tab} label={x.icon} key={i} />
                ))}
            </Tabs>
            {props.tabs.map((x, i) => (value === i ? <ProviderTabPanel key={i}>{x.panel}</ProviderTabPanel> : null))}
        </Box>
    )
}
