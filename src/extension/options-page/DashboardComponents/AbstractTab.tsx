import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, createStyles, Tabs, Tab, Typography, Box, TypographyProps, BoxProps, Paper } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tabs: {},
    }),
)

interface TabPanelProps extends BoxProps {
    label: string
}

const TabPanel = (props: TabPanelProps & { value: number; index: number }) => {
    const { value, index, display, label, ...other } = props

    return <Box role="tabpanel" display={value !== index ? 'none' : display} {...other} />
}

export interface AbstractTabProps {
    tabs: TabPanelProps[]
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
                {
                    // TODO!: tabs overflow
                }
                <Tabs
                    variant="fullWidth"
                    className={classes.tabs}
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary">
                    {tabs.map((tab) => (
                        <Tab component="span" label={tab.label} key={tab.label} />
                    ))}
                </Tabs>
            </Paper>
            {tabs.map((tab, index) => (
                <TabPanel value={value} index={index} height={height} minHeight={height} key={tab.label} {...tab} />
            ))}
        </div>
    )
}
