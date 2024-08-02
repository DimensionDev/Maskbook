import { Children, useState, type HTMLProps, type ComponentType, type ReactElement } from 'react'
import { makeStyles } from '../../UIHelper/makeStyles.js'
import { MaskColorVar } from '../../CSSVariables/index.js'

const useStyles = makeStyles<void, 'selected'>()((theme, _, refs) => {
    const { palette } = theme
    const isDark = palette.mode === 'dark'
    const inactiveColor = isDark ? theme.palette.grey['50'] : MaskColorVar.twitterBg
    const selected = {}
    return {
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

export function FolderTabPanel({ className, ...rest }: TabPanelProps) {
    const { classes, cx } = useStyles()
    return <div className={cx(classes.tabPanel, className)} role="tabpanel" {...rest} />
}

// this is a subtype of ReactElement
// eslint-disable-next-line @typescript-eslint/no-restricted-types
type TabPanelReactElement = ReactElement<TabPanelProps, ComponentType<TabPanelProps>>

interface FolderTabsProps extends Pick<HTMLProps<HTMLDivElement>, 'defaultValue' | 'children'> {}

export function FolderTabs({ children: childNodes, defaultValue = 0 }: FolderTabsProps) {
    const { classes, cx } = useStyles()
    const [value, setValue] = useState(defaultValue)
    const tabs = Children.map(childNodes as TabPanelReactElement[], (child, index) => {
        const label = child.props.label
        const childValue = child.props.value ?? index
        const selected = value === childValue
        return (
            <button
                key={label}
                type="button"
                tabIndex={index === 0 ? 0 : -1}
                role="tab"
                className={cx(classes.tab, selected ? classes.selected : null)}
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
