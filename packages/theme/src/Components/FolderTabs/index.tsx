import { Children, FC, useState, HTMLProps, ReactElement } from 'react'
import classnames from 'classnames'
import { makeStyles } from '../../UIHelper/makeStyles'
import { MaskColorVar } from '../../CSSVariables'

const useStyles = makeStyles<void, 'selected'>()((theme, _, refs) => {
    const { palette } = theme
    const isDark = palette.mode === 'dark'
    const inactiveColor = isDark ? theme.palette.grey['50'] : MaskColorVar.twitterBg
    const selected = {}
    return {
        folderTabs: {},
        selected,
        tabList: {
            display: 'flex',
            gap: 8,
        },
        tab: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            height: 40,
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            backgroundColor: inactiveColor,
            border: `1px solid ${inactiveColor}`,
            borderBottomColor: 'transparent',
            color: theme.palette.text.secondary,
            position: 'relative',
            boxSizing: 'border-box',
            [`&.${refs.selected}`]: {
                backgroundColor: theme.palette.background.paper,
                borderColor: MaskColorVar.twitterBorderLine,
                color: theme.palette.primary.main,
            },
            // cover bottom border of the active tab
            [`&.${refs.selected}::after`]: {
                position: 'absolute',
                content: '""',
                height: 2,
                borderLeft: `1px solid ${MaskColorVar.twitterBorderLine}`,
                borderRight: `1px solid ${MaskColorVar.twitterBorderLine}`,
                backgroundColor: theme.palette.background.paper,
                bottom: '-2px',
                left: -1,
                right: -1,
            },
        },
        tabPanel: {
            backgroundColor: theme.palette.background.paper,
        },
        tabContent: {
            border: `1px solid ${MaskColorVar.twitterBorderLine}`,
            padding: 12,
            borderRadius: '0 0 8px 8px',
        },
    }
})

interface TabPanelProps extends HTMLProps<HTMLDivElement> {
    label: string
    value?: number | string
}

export const FolderTabPanel: FC<TabPanelProps> = ({ className, ...rest }) => {
    const { classes } = useStyles()
    return <div className={classnames(classes.tabPanel, className)} role="tabpanel" {...rest} />
}

type TabPanelReactElement = ReactElement<TabPanelProps, FC<TabPanelProps>>

interface FolderTabsProps extends HTMLProps<HTMLDivElement> {}

export const FolderTabs: FC<FolderTabsProps> = ({ children: childNodes, defaultValue = 0, ...rest }) => {
    const { classes } = useStyles()
    const [value, setValue] = useState(defaultValue)
    const tabs = Children.map(childNodes as TabPanelReactElement[], (child, index) => {
        const label = child.props.label
        const childValue = child.props.value ?? index
        const selected = value === childValue
        return (
            <button
                key={label}
                tabIndex={index === 0 ? 0 : -1}
                role="tab"
                className={classnames(classes.tab, selected ? classes.selected : null)}
                onClick={() => setValue(childValue)}>
                {label}
            </button>
        )
    })
    const children = Children.map(childNodes as TabPanelReactElement[], (child, index) => {
        const childValue = child.props.value ?? index
        const selected = value === childValue
        return selected ? child : null
    })
    if (!tabs.length) return null
    return (
        <div>
            <div className={classes.tabList} role="tablist">
                {tabs}
            </div>
            <div className={classes.tabContent}>{children}</div>
        </div>
    )
}
