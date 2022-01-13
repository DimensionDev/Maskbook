import { styled } from '@mui/material'
// import {
// TabPanelUnstyled,
// TabPanelUnstyledProps,
// TabsListUnstyled,
// TabsUnstyled,
// TabsUnstyledProps,
// TabUnstyled,
// tabUnstyledClasses,
// } from '@mui/base'
import { Children, cloneElement, FC, useState, HTMLProps } from 'react'
import { MaskColorVar } from '../../constants'

const TabList = styled('div')`
    display: flex;
    gap: 8px;
`

const Tab = styled('button')(({ theme }) => {
    const isDark = theme.palette.mode === 'dark'
    const inactiveColor = isDark ? theme.palette.grey['50'] : MaskColorVar.twitterBg
    return {
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
        ['&.selected']: {
            backgroundColor: theme.palette.background.paper,
            borderColor: MaskColorVar.twitterBorderLine,
            color: theme.palette.primary.main,
        },
        // cover bottom border of the active tab
        ['&.selected::after']: {
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
    }
})

const PanelContent = styled('div')`
    border: 1px solid ${MaskColorVar.twitterBorderLine};
    padding: 12px;
    border-radius: 0 0 8px 8px;
`

interface TabPanelProps extends HTMLProps<HTMLDivElement> {
    label: string
    value?: number | string
}

export const FolderTabPanel = styled('div')<TabPanelProps>(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}))

type TabPanelReactElement = React.ReactElement<TabPanelProps, FC<TabPanelProps>>

interface FolderTabsProps extends HTMLProps<HTMLDivElement> {}

export const FolderTabs: FC<FolderTabsProps> = ({ children: childNodes, defaultValue = 0, ...rest }) => {
    const [value, setValue] = useState(defaultValue)
    const tabs = Children.map(childNodes as TabPanelReactElement[], (child, index) => {
        const label = child.props.label
        const childValue = child.props.value ?? index
        const selected = value === childValue
        return (
            <Tab
                key={label}
                tabIndex={index === 0 ? 0 : -1}
                role="tab"
                className={selected ? 'selected' : ''}
                onClick={() => setValue(childValue)}>
                {label}
            </Tab>
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
            <TabList>{tabs}</TabList>
            <PanelContent>{children}</PanelContent>
        </div>
    )
}
