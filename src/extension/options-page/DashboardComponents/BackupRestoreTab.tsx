import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, createStyles, AppBar, Tabs, Tab, Typography, Box, TypographyProps, BoxProps } from '@material-ui/core'
import classNames from 'classnames'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        panelBorder: {
            border: `1px solid ${theme.palette.type === 'dark' ? 'rgba(1, 1, 1, 0.3)' : 'rgba(33, 33, 33, 0.08)'}`,
        },
        panelBorderMargin: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        panelBorderMarginTop: {
            marginTop: theme.spacing(2),
        },
        appbarBackground: {
            background: theme.palette.type === 'dark' ? 'rgba(1, 1, 1, 0.2)' : 'rgba(33, 33, 33, 0.08)',
        },
        tabSelected: {
            background: theme.palette.type === 'dark' ? 'rgba(18, 12, 40, 0.2)' : 'rgba(237, 243, 254, 0.8)',
        },
    }),
)

const TabPanel = (props: TypographyProps & Pick<BoxProps, 'p' | 'height'> & { value: number; index: number }) => {
    const { children, value, index, p, height, ...other } = props

    return (
        <Typography component="div" role="tabpanel" hidden={value !== index} {...other}>
            <Box {...(height ? { style: { height } } : {})} p={p ?? 3}>
                {children}
            </Box>
        </Typography>
    )
}

export interface BackupRestoreTabProps {
    tabs: { label: string; component: JSX.Element | null; p?: number }[]
    state: [number, React.Dispatch<React.SetStateAction<number>>]
    margin?: true | 'top'
    height?: number
}

export default function BackupRestoreTab(props: BackupRestoreTabProps) {
    const { tabs, state, margin, height } = props

    const classes = useStyles()
    const [value, setValue] = state

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue)
    }

    const marginClass = margin === 'top' ? classes.panelBorderMarginTop : margin && classes.panelBorderMargin

    return (
        <div className={classNames(classes.panelBorder, marginClass)}>
            <AppBar
                classes={{ colorPrimary: classes.appbarBackground }}
                position="static"
                color="primary"
                elevation={0}>
                <Tabs
                    TabIndicatorProps={{ style: { width: `${100 / tabs.length}%` } }}
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth">
                    {tabs.map(tab => (
                        <Tab classes={{ selected: classes.tabSelected }} label={tab.label} />
                    ))}
                </Tabs>
            </AppBar>
            {tabs.map((tab, index) => (
                <TabPanel height={height} value={value} index={index} p={tab.p}>
                    {tab.component}
                </TabPanel>
            ))}
        </div>
    )
}
