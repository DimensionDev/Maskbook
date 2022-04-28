import { Button, ButtonGroup, ButtonGroupProps, styled, Tab } from '@mui/material'
import { useTabContext, getPanelId, getTabId } from '@mui/lab/TabContext'
import {
    forwardRef,
    cloneElement,
    Children,
    isValidElement,
    useState,
    useRef,
    useEffect,
    useImperativeHandle,
} from 'react'
import { BaseTab } from './BaseTab'
import { FlexibleTab } from './FlexibleTab'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew' // flexBasis: theme.spacing(3),
import { useWindowSize } from 'react-use'

type MaskTabVariant = 'base' | 'flexible' | 'round'

export interface MaskTabListProps
    extends React.PropsWithChildren<Pick<ButtonGroupProps, 'classes' | 'disabled' | 'fullWidth' | 'size'>> {
    onChange(event: object, value: string): void
    'aria-label': string
    variant?: MaskTabVariant
}

const ArrowButtonWrap = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    padding: theme.spacing(1.5),
    height: 38,
    width: 38,
    background: '#F2F6FA',

    '&:hover': {
        background: '#F2F6FA',
    },
}))

const ArrowBackIosNewIconWrap = styled(ArrowBackIosNewIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
}))

const ButtonGroupWrap = styled(ButtonGroup, {
    shouldForwardProp: (prop) => prop !== 'maskVariant' && prop !== 'isOpen' && prop !== 'isOverflow',
})<{ maskVariant?: MaskTabVariant; isOpen: boolean; isOverflow: boolean }>(
    ({ theme, maskVariant, isOpen, isOverflow }) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: maskVariant === 'flexible' && isOpen ? 'wrap' : 'nowrap',
        overflow: 'hidden',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        flex: 1,
        transform: '',
        background:
            maskVariant === 'flexible' && !isOpen && isOverflow
                ? 'linear-gradient(270deg, rgba(223, 229, 244, 0.8) 36px, rgba(244, 247, 254, 0) 20%)'
                : 'transparent',
    }),
)

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
    const [open, handleToggle] = useState<boolean>(false)
    const [isTabsOverflow, setTabsOverflow] = useState<boolean>(false)
    const innerRef = useRef<HTMLDivElement>(null)
    const { width } = useWindowSize()

    if (context === null) throw new TypeError('No TabContext provided')

    const { onChange, variant = 'base', ...rest } = props

    useImperativeHandle(ref, () => innerRef?.current!)

    useEffect(() => {
        if (!innerRef?.current) return

        const current = innerRef.current as unknown as HTMLDivElement
        setTabsOverflow(current?.scrollWidth > current?.clientWidth)
    }, [innerRef.current, width])

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) return child
        const extra = {
            'aria-controls': getPanelId(context, child.props.value),
            id: getTabId(context, child.props.value),
            selected: child.props.value === context.value,
            onChange: props.onChange,
        }
        if (child.type === Tab && variant === 'base') {
            return (
                <BaseTab value={child.props.value} {...extra}>
                    {child.props.label}
                </BaseTab>
            )
        }
        if (child.type === Tab && variant === 'flexible') {
            return (
                <FlexibleTab value={child.props.value} {...extra}>
                    {child.props.label}
                </FlexibleTab>
            )
        }
        return cloneElement(child, extra)
    })

    return (
        <ButtonGroupWrap
            maskVariant={variant}
            isOpen={open}
            isOverflow={isTabsOverflow}
            {...rest}
            ref={innerRef}
            role="tablist">
            {children}
            {variant === 'flexible' && isTabsOverflow && (
                <ArrowButtonWrap
                    variant="text"
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select tabs list"
                    aria-haspopup="menu"
                    onClick={() => handleToggle(!open)}>
                    <ArrowBackIosNewIconWrap sx={{ transform: open ? 'rotate(90deg)' : 'rotate(270deg)' }} />
                </ArrowButtonWrap>
            )}
        </ButtonGroupWrap>
    )
})
