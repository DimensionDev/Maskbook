import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Theme, createStyles, Tabs, Tab, Box, BoxProps, Paper } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tab: {
            minWidth: 'unset',
        },
        tabPanel: {
            marginTop: theme.spacing(3),
        },
    }),
)

interface TabPanelProps extends BoxProps {
    label: string
}

export interface AbstractTabProps {
    tabs: Omit<TabPanelProps, 'height' | 'minHeight'>[]
    state: [number, React.Dispatch<React.SetStateAction<number>>]
    margin?: true | 'top' | 'bottom'
    height?: number | string
}

export default function AbstractTab({ tabs, state, height = 200 }: AbstractTabProps) {
    const classes = useStyles()
    const [value, setValue] = state

    return (
        <>
            <Paper square elevation={0}>
                <Tabs
                    value={value}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(_: React.ChangeEvent<{}>, newValue: number) => setValue(newValue)}>
                    {tabs.map((tab) => (
                        <Tab className={classes.tab} component="span" label={tab.label} key={tab.label} />
                    ))}
                </Tabs>
            </Paper>
            <Box
                className={classes.tabPanel}
                height={height}
                minHeight={height}
                role="tabpanel"
                {...tabs.find((_, index) => index === value)}
            />
        </>
    )
}
