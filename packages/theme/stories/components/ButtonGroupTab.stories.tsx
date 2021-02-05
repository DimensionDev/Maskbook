import { story, MuiArgs } from '../utils'
import { ButtonGroup, Button, Tab, Tabs, ButtonProps } from '@material-ui/core'
import TabContext, { useTabContext, getPanelId, getTabId } from '@material-ui/lab/TabContext'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'
import { forwardRef, useState, cloneElement, Children, isValidElement } from 'react'

// Prior art: TabList + Tabs
const ButtonGroupTabList = forwardRef<
    HTMLDivElement,
    React.PropsWithChildren<{ 'aria-label': string; onChange(event: object, value: string): void }>
>((props, ref) => {
    const context = useTabContext()

    if (context === null) {
        throw new TypeError('No TabContext provided')
    }

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) return child
        return cloneElement(child, {
            'aria-controls': getPanelId(context, child.props.value),
            id: getTabId(context, child.props.value),
            selected: child.props.value === context.value,
            onChange: props.onChange,
        })
    })
    return (
        <ButtonGroup ref={ref} role="tablist" aria-label={props['aria-label']}>
            {children}
        </ButtonGroup>
    )
})

// Prior art: Tab
const ButtonTab = forwardRef<
    HTMLButtonElement | null,
    React.PropsWithChildren<
        { value: string; selected?: boolean; onChange?(event: object, value: string): void } & Omit<
            ButtonProps,
            'onChange'
        >
    >
>((props, ref) => {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: any) => {
        if (!activated && onChange) {
            onChange(event, value)
        }

        if (onClick) {
            onClick(event)
        }
    }
    return (
        <Button
            ref={ref}
            {...props}
            role="tab"
            aria-selected={activated}
            color={activated ? 'primary' : 'secondary'}
            tabIndex={activated ? 0 : -1}
            onClick={handleClick}
            onChange={undefined}
            disableElevation
            variant="contained"
        />
    )
})

const { meta, of } = story(function () {
    const [state, setState] = useState('1')
    return (
        <TabContext value={state}>
            <ButtonGroupTabList onChange={(e, v) => setState(v)} aria-label="My tab?">
                <ButtonTab value="1">One</ButtonTab>
                <ButtonTab value="2">Two</ButtonTab>
                <ButtonTab value="3">Three</ButtonTab>
            </ButtonGroupTabList>
            <TabPanel value="1">Tab One</TabPanel>
            <TabPanel value="2">Tab Two</TabPanel>
            <TabPanel value="3">Tab Three</TabPanel>
        </TabContext>
    )
})
export default meta({
    title: 'Components/Button Group Tab',
    argTypes: {},
})

export const ButtonGroupTab = of({
    args: {},
})
