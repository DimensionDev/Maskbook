import { styled } from '@mui/material'
import {
    TabPanelUnstyled,
    TabPanelUnstyledProps,
    TabsListUnstyled,
    TabsUnstyled,
    TabsUnstyledProps,
    TabUnstyled,
    tabUnstyledClasses,
} from '@mui/base'
import { Children, cloneElement, FC } from 'react'
import { MaskColorVar } from '../../constants'

const TabList = styled(TabsListUnstyled)`
    display: flex;
    gap: 8px;
`

const Tab = styled(TabUnstyled)(({ theme }) => {
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
        [`&.${tabUnstyledClasses.selected}`]: {
            backgroundColor: theme.palette.background.paper,
            borderColor: MaskColorVar.twitterBorderLine,
            color: theme.palette.primary.main,
        },
        // cover bottom border of the active tab
        [`&.${tabUnstyledClasses.selected}::after`]: {
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

interface TabPanelProps extends Omit<TabPanelUnstyledProps, 'value'> {
    label: string
    value?: TabPanelUnstyledProps['value']
}

export const FolderTabPanel = styled(TabPanelUnstyled)<TabPanelProps>(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}))

type TabPanelReactElement = React.ReactElement<TabPanelProps, FC<TabPanelProps>>

interface FolderTabsProps extends TabsUnstyledProps {}

export const FolderTabs: FC<FolderTabsProps> = ({ children: childNodes, defaultValue = 0, ...rest }) => {
    const labels = Children.map(childNodes as TabPanelReactElement[], (child) => child.props.label)
    const children = Children.map(childNodes as TabPanelReactElement[], (child, index) =>
        cloneElement(child, {
            value: child.props.value ?? index,
        }),
    )
    if (!labels.length) return null
    return (
        <TabsUnstyled defaultValue={defaultValue} {...rest}>
            <TabList>
                {labels.map((label) => (
                    <Tab key={label}>{label}</Tab>
                ))}
            </TabList>
            <PanelContent>{children}</PanelContent>
        </TabsUnstyled>
    )
}
