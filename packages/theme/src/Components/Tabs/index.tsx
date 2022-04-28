import { ButtonGroup, ButtonGroupProps, styled, Tab } from '@mui/material'
import { useTabContext, getPanelId, getTabId } from '@mui/lab/TabContext'
import { forwardRef, cloneElement, Children, isValidElement } from 'react'
import { BaseTab } from './BaseTab'

export interface MaskTabListProps
    extends React.PropsWithChildren<Pick<ButtonGroupProps, 'classes' | 'disabled' | 'fullWidth' | 'size'>> {
    onChange(event: object, value: string): void
    'aria-label': string
    variant?: 'base' | 'flexible' | 'round'
}

const ButtonGroupWrap = styled(ButtonGroup)(({ theme }) => ({
    display: 'flex',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flex: 1,
}))

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
 *          <MaskTabList onChange={onChange}>
 *              <Tab label="Item One" value={tabs.tab1} />
 *              <Tab label="Item Two" value={tabs.tab2} />
 *              <Tab label="Item Three" value={tabs.tab3} />
 *          </MaskTabList>
 *          <TabPanel value={tabs.tab1}>Item One</TabPanel>
 *          <TabPanel value={tabs.tab2}>Item Two</TabPanel>
 *          <TabPanel value={tabs.tab3}>Item Three</TabPanel>
 *      </TabContext>
 *  )
 */
export const MaskTabList = forwardRef<HTMLDivElement, MaskTabListProps>((props, ref) => {
    const context = useTabContext()
    if (context === null) throw new TypeError('No TabContext provided')

    const { onChange, variant = 'base', ...rest } = props

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) return child
        const extra = {
            'aria-controls': getPanelId(context, child.props.value),
            id: getTabId(context, child.props.value),
            selected: child.props.value === context.value,
            onChange: props.onChange,
        }
        if (child.type === Tab) {
            return (
                <BaseTab value={child.props.value} {...extra}>
                    {child.props.label}
                </BaseTab>
            )
        }
        return cloneElement(child, extra)
    })

    return (
        <ButtonGroupWrap {...rest} ref={ref} role="tablist">
            {children}
        </ButtonGroupWrap>
    )
})
