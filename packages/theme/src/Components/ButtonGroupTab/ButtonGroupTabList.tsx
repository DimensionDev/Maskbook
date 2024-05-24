import { ButtonGroup, type ButtonGroupProps, Tab } from '@mui/material'
import { useTabContext, getPanelId, getTabId } from '@mui/lab'
import { forwardRef, cloneElement, Children, isValidElement } from 'react'
import { ButtonTab } from './ButtonGroupTab.js'
export interface ButtonGroupTabListProps
    extends React.PropsWithChildren<Pick<ButtonGroupProps, 'classes' | 'disabled' | 'fullWidth' | 'size'>> {
    onChange(event: object, value: string): void
    'aria-label': string
}
/**
 * This component is like TabList + Tabs in the @mui/material.
 * It should be used with <ButtonGroupTab>.
 *
 * Warning: Only a few "value" and "label" props on the @mui/material <Tab> component will work.
 *
 * @example
 *  const [currentTab, onChange, tabs, setTab] = useTab('tab1', 'tab2', 'tab3')
 *  return (
 *      <TabContext value={currentTab}>
 *          <ButtonGroupTabList onChange={onChange}>
 *              <Tab label="Item One" value={tabs.tab1} />
 *              <Tab label="Item Two" value={tabs.tab2} />
 *              <Tab label="Item Three" value={tabs.tab3} />
 *          </ButtonGroupTabList>
 *          <TabPanel value={tabs.tab1}>Item One</TabPanel>
 *          <TabPanel value={tabs.tab2}>Item Two</TabPanel>
 *          <TabPanel value={tabs.tab3}>Item Three</TabPanel>
 *      </TabContext>
 *  )
 */
export const ButtonGroupTabList = forwardRef<HTMLDivElement, ButtonGroupTabListProps>((props, ref) => {
    const context = useTabContext()
    if (context === null) throw new TypeError('No TabContext provided')

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) return child
        const childProps: any = child.props
        const extra = {
            'aria-controls': getPanelId(context, childProps.value),
            id: getTabId(context, childProps.value),
            selected: childProps.value === context.value,
            onChange: props.onChange,
        }
        if (child.type === Tab) {
            return (
                <ButtonTab value={childProps.value} {...extra}>
                    {childProps.label}
                </ButtonTab>
            )
        }
        return cloneElement(child, extra)
    })

    const { onChange, ...rest } = props

    return (
        <ButtonGroup {...rest} ref={ref} role="tablist">
            {children}
        </ButtonGroup>
    )
})

ButtonGroupTabList.displayName = 'ButtonGroupTabList'
