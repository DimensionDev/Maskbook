import { Box, Button, ButtonGroup, ButtonGroupProps, styled, Tab } from '@mui/material'
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
    ForwardRefExoticComponent,
} from 'react'
import { BaseTab } from './BaseTab'
import { FlexibleTab } from './FlexibleTab'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useWindowSize } from 'react-use'
import { RoundTab } from './RoundTab'
import { get } from 'lodash-unified'

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
    background: get(theme.palette.background, 'input') ?? '#F2F6FA',

    '&:hover': {
        background: get(theme.palette.background, 'input') ?? '#F2F6FA',
    },
}))

const ArrowBackIosNewIconWrap = styled(ArrowBackIosNewIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    width: 16,
    borderRadius: '0 8px 8px 0',
}))

const ButtonGroupWrap = styled(ButtonGroup, {
    shouldForwardProp: (prop) => prop !== 'maskVariant' && prop !== 'isOpen' && prop !== 'isOverflow',
})<{ maskVariant?: MaskTabVariant; isOpen?: boolean; isOverflow?: boolean }>(
    ({ theme, maskVariant = 'base', isOpen = false, isOverflow = false }) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflow: 'hidden',
        flex: 1,
        gap: maskVariant !== 'base' ? theme.spacing(1) : 0,
        background: 'transparent',
    }),
)

const FlexButtonGroupWrap = styled(ButtonGroup, {
    shouldForwardProp: (prop) => prop !== 'maskVariant' && prop !== 'isOpen' && prop !== 'isOverflow',
})<{ maskVariant?: MaskTabVariant; isOpen?: boolean; isOverflow?: boolean }>(
    ({ theme, maskVariant = 'base', isOpen = false, isOverflow = false }) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        flexWrap: isOpen ? 'wrap' : 'nowrap',
        overflow: 'hidden',
        flex: 1,
        maxWidth: '100%',
        gap: maskVariant !== 'base' ? theme.spacing(1) : 0,
        borderRadius: 0,
        background:
            !isOpen && isOverflow
                ? 'linear-gradient(270deg,rgba(255,255,255,1) 40px, rgba(223, 229, 244, 0.8) 40px, rgba(244, 247, 254, 0) 72px)'
                : theme.palette.background.paper,
    }),
)

const tabMapping: { [key in MaskTabVariant]: ForwardRefExoticComponent<any> } = {
    flexible: FlexibleTab,
    round: RoundTab,
    base: BaseTab,
}

/**
 * This component is like TabList + Tabs in the @mui/material.
 * It should be used with <ButtonGroupTab>.
 *
 * Warning: Only a few "value" and "label" props on the @mui/material <Tab> component will work.
 *
 * @example
 *  const [currentTab, onChange, tabs, setTab] = useTabs('tab1', 'tab2', 'tab3')
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
    const [isTabsOverflow, setIsTabsOverflow] = useState(false)
    const innerRef = useRef<HTMLDivElement>(null)
    const { width } = useWindowSize()

    if (context === null) throw new TypeError('No TabContext provided')

    const { onChange, variant = 'base', ...rest } = props

    useImperativeHandle(ref, () => innerRef?.current!)

    useEffect(() => {
        if (!innerRef?.current) return

        const current = innerRef.current
        setIsTabsOverflow(current?.scrollWidth > current?.clientWidth)
    }, [innerRef.current, width])

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) return child
        const extra = {
            'aria-controls': getPanelId(context, child.props.value),
            id: getTabId(context, child.props.value),
            selected: child.props.value === context.value,
            onChange: props.onChange,
        }

        if (child.type === Tab) {
            const C = tabMapping[variant]
            return (
                <C value={child.props.value} {...extra}>
                    {child.props.label}
                </C>
            )
        }

        return cloneElement(child, extra)
    })

    if (variant === 'flexible') {
        return (
            <Box position="relative">
                <ButtonGroupWrap style={{ visibility: 'hidden', height: 38 }}>{[]}</ButtonGroupWrap>
                <FlexButtonGroupWrap
                    maskVariant={variant}
                    isOpen={open}
                    isOverflow={isTabsOverflow}
                    {...rest}
                    ref={innerRef}
                    role="tablist">
                    {children}
                    {isTabsOverflow && (
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
                </FlexButtonGroupWrap>
            </Box>
        )
    }

    return (
        <ButtonGroupWrap maskVariant={variant} {...rest} ref={innerRef} role="tablist">
            {children}
        </ButtonGroupWrap>
    )
})
