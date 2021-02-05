import { ButtonGroup, ButtonGroupProps, Tab } from '@material-ui/core'
import { useTabContext, getPanelId, getTabId } from '@material-ui/lab/TabContext'
import { forwardRef, cloneElement, Children, isValidElement } from 'react'
import { ButtonTab } from './ButtonGroupTab'
export interface ButtonGroupTabListProps
    extends React.PropsWithChildren<Pick<ButtonGroupProps, 'classes' | 'disabled' | 'fullWidth' | 'size'>> {
    onChange(event: object, value: string): void
    'aria-label': string
}
/**
 * This component is like TabList + Tabs in the @material-ui.
 * It should be used with <ButtonGroupTab>.
 *
 * Warning: Only a few "value" and "label" props on the @material-ui <Tab> component will work.
 *
 * @example
 * enum Tabs { One = 'One', Two = 'Two', Three = 'Three' }
 * const [state, setState] = useState(Tabs.One as string)
 * return (
 *      <TabContext value={String(state)}>
 *          <ButtonGroupTabList onChange={(e, v) => setState(v)} aria-label="My tab?">
 *              <Tab value={Tabs.One} label="One" />
 *              <Tab value={Tabs.Two} label="Two" />
 *              <Tab value={Tabs.Three} label="Three" />
 *          </ButtonGroupTabList>
 *          <TabPanel value={Tabs.One}>Tab One</TabPanel>
 *          <TabPanel value={Tabs.Two}>Tab Two</TabPanel>
 *          <TabPanel value={Tabs.Three}>Tab Three</TabPanel>
 *      </TabContext>
 * )
 */
export const ButtonGroupTabList = forwardRef<HTMLDivElement, ButtonGroupTabListProps>((props, ref) => {
    const context = useTabContext()
    if (context === null) throw new TypeError('No TabContext provided')

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
                <ButtonTab value={child.props.value} {...extra}>
                    {child.props.label}
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
