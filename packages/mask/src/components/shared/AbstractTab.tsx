import { makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { Tabs, Tab, Box, BoxProps, Paper } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    tab: {
        minWidth: 'unset',
    },
    tabPanel: {
        marginTop: theme.spacing(1),
    },
    disabledTab: {
        opacity: 0.5,
    },
    flexContainer: {},
}))

interface TabPanelProps extends BoxProps {
    id?: string
    label: string | React.ReactNode
    disabled?: boolean
}

export interface AbstractTabProps
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper' | 'flexContainer'> {
    tabs: Array<
        Omit<TabPanelProps, 'height' | 'minHeight'> & {
            cb?: () => void
            disableFocusRipple?: boolean
            disableRipple?: boolean
        }
    >
    state?: readonly [number, (next: number) => void]
    index?: number
    disableFocusRipple?: boolean
    disableRipple?: boolean
    margin?: true | 'top' | 'bottom'
    height?: number | string
    hasOnlyOneChild?: boolean
    scrollable?: boolean
}

export default function AbstractTab(props: AbstractTabProps) {
    const { tabs, state, index, height = 200, hasOnlyOneChild = false, scrollable = false } = props
    const classes = useStylesExtends(useStyles(), props)
    const [value, setValue] = state ?? [undefined, undefined]
    const tabIndicatorStyle = tabs.length && !scrollable ? { width: 100 / tabs.length + '%' } : undefined

    return (
        <>
            <Paper square elevation={0} className={classes.tabPaper}>
                <Tabs
                    className={classes.tabs}
                    classes={{
                        indicator: classes.indicator,
                        flexContainer: classes.flexContainer,
                    }}
                    value={index ? index : value ? value : 0}
                    indicatorColor="primary"
                    textColor="primary"
                    variant={scrollable ? 'scrollable' : 'fullWidth'}
                    TabIndicatorProps={{ style: tabIndicatorStyle }}
                    scrollButtons={scrollable}
                    allowScrollButtonsMobile={scrollable}
                    onChange={(_: React.SyntheticEvent, newValue: number) => setValue?.(newValue)}>
                    {tabs.map((tab, i) => (
                        <Tab
                            disabled={tab.disabled}
                            className={classNames(
                                classes.tab,
                                [index, value].includes(i) ? classes.focusTab : '',
                                tab.disabled ? classes.disabledTab : '',
                            )}
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
                        height,
                        minHeight: height,
                    }}
                />
            ) : null}
        </>
    )
}
