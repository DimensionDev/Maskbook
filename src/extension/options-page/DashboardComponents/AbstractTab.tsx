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
    id?: string
    label: string
}

export interface AbstractTabProps {
    tabs: Omit<TabPanelProps, 'height' | 'minHeight'>[]
    state: readonly [number, (next: number) => void]
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
                    onChange={(_: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
                    {tabs.map((tab) => (
                        <Tab
                            className={classes.tab}
                            label={tab.label}
                            key={tab.label}
                            data-testid={`${tab.id?.toLowerCase()}_tab`}
                        />
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
