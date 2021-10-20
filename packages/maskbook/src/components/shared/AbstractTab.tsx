import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { Tabs, Tab, Box, BoxProps, Paper } from '@material-ui/core'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    tab: {
        minWidth: 'unset',
    },
    tabPanel: {
        marginTop: theme.spacing(1),
    },
}))

interface TabPanelProps extends BoxProps {
    id?: string
    label: string | React.ReactNode
}

export interface AbstractTabProps
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    tabs: (Omit<TabPanelProps, 'height' | 'minHeight'> & {
        cb?: () => void
        disableFocusRipple?: boolean
        disableRipple?: boolean
    })[]
    state?: readonly [number, (next: number) => void]
    index?: number
    disableFocusRipple?: boolean
    disableRipple?: boolean
    margin?: true | 'top' | 'bottom'
    height?: number | string
    hasOnlyOneChild?: boolean
}

export default function AbstractTab(props: AbstractTabProps) {
    const { tabs, state, index, height = 200, hasOnlyOneChild = false } = props
    const classes = useStylesExtends(useStyles(), props)
    const [value, setValue] = state ?? [undefined, undefined]
    const tabIndicatorStyle = tabs.length ? { width: 100 / tabs.length + '%' } : undefined

    return (
        <>
            <Paper square elevation={0} className={classes.tabPaper}>
                <Tabs
                    className={classes.tabs}
                    classes={{
                        indicator: classes.indicator,
                    }}
                    value={index ? index : value ? value : 0}
                    TabIndicatorProps={{ style: tabIndicatorStyle }}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(_: React.SyntheticEvent, newValue: number) => setValue?.(newValue)}>
                    {tabs.map((tab, i) => (
                        <Tab
                            className={classNames(classes.tab, [index, value].includes(i) ? classes.focusTab : '')}
                            disableFocusRipple={tab.disableFocusRipple}
                            disableRipple={tab.disableRipple}
                            onClick={tab.cb}
                            label={tab.label}
                            key={i}
                            data-testid={`${tab.id?.toLowerCase()}_tab`}
                        />
                    ))}
                </Tabs>
            </Paper>
            {!hasOnlyOneChild ? (
                <Box
                    className={classes.tabPanel}
                    role="tabpanel"
                    {...tabs.find((_, index) => index === value)}
                    sx={{
                        height: height,
                        minHeight: height,
                    }}
                />
            ) : null}
        </>
    )
}
