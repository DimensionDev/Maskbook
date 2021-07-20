import { makeStyles } from '@material-ui/core/styles'
import { Theme, Tabs, Tab, Box, BoxProps, Paper } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
    tab: {
        minWidth: 'unset',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
}))

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
    const tabIndicatorStyle = tabs.length ? { width: 100 / tabs.length + '%' } : undefined

    return (
        <>
            <Paper square elevation={0}>
                <Tabs
                    value={value}
                    TabIndicatorProps={{ style: tabIndicatorStyle }}
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
                role="tabpanel"
                {...tabs.find((_, index) => index === value)}
                sx={{
                    height: height,
                    minHeight: height,
                }}
            />
        </>
    )
}
