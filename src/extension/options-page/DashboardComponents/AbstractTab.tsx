import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, createStyles, Tabs, Tab, Box, BoxProps, Paper } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tab: {
            minWidth: 'unset',
        },
    }),
)

interface TabPanelProps extends BoxProps {
    label: string
}

const TabPanel = (props: Omit<TabPanelProps, 'label'> & { value: number; index: number }) => {
    const { value, index, display, ...other } = props

    return <Box role="tabpanel" display={value !== index ? 'none' : display} {...other} />
}

export interface AbstractTabProps {
    tabs: Omit<TabPanelProps, 'height' | 'minHeight'>[]
    state: [number, React.Dispatch<React.SetStateAction<number>>]
    margin?: true | 'top' | 'bottom'
    height?: number | string
    minHeight?: number
}

export default function AbstractTab(props: AbstractTabProps) {
    const { tabs, state, height, minHeight } = props

    const classes = useStyles()
    const [value, setValue] = state

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue)
    }

    return (
        <div>
            <Paper square elevation={0}>
                <Tabs
                    variant="fullWidth"
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary">
                    {tabs.map((tab) => (
                        <Tab className={classes.tab} component="span" label={tab.label} key={tab.label} />
                    ))}
                </Tabs>
            </Paper>
            {tabs.map(({ label, ...tab }, index) => (
                <TabPanel value={value} index={index} height={height} minHeight={height} key={label} {...tab} />
            ))}
        </div>
    )
}
