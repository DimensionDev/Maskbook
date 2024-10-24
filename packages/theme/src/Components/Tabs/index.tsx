import {
    Box,
    Button,
    ButtonGroup,
    type ButtonGroupProps,
    styled,
    Tab,
    alpha,
    type ButtonGroupClasses,
} from '@mui/material'
import { useTabContext, getPanelId, getTabId } from '@mui/lab'
import {
    Children,
    isValidElement,
    useState,
    useRef,
    useImperativeHandle,
    useMemo,
    useCallback,
    type Ref,
    type ComponentType,
} from 'react'
import { BaseTab } from './BaseTab.js'
import { FlexibleTab } from './FlexibleTab.js'
import { ArrowBackIosNew as ArrowBackIosNewIcon } from '@mui/icons-material'
import { useClickAway, useWindowSize } from 'react-use'
import { RoundTab } from './RoundTab.js'

type MaskTabVariant = 'base' | 'flexible' | 'round'
const defaultTabSize = 38

export interface MaskTabListProps
    extends Omit<ButtonGroupProps, 'variant' | 'onChange' | 'classes' | 'ref'>,
        withClasses<keyof ButtonGroupClasses | 'arrowButton'> {
    onChange(event: object, value: string): void
    'aria-label'?: string
    variant?: MaskTabVariant
    hideArrowButton?: boolean
    ref?: Ref<HTMLDivElement | undefined> | undefined
}

const ArrowButtonWrap = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    padding: theme.spacing(1.5),
    height: defaultTabSize,
    width: defaultTabSize,
    minWidth: `${defaultTabSize}px !important`,
    background: theme.palette.background.input,
    '&:hover': {
        background: theme.palette.background.input,
    },
}))

const ArrowBackIosNewIconWrap = styled(ArrowBackIosNewIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    width: 16,
    borderRadius: '0 8px 8px 0',
}))

const FlexibleButtonGroupPanel = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isOpen',
})<{
    isOpen?: boolean
}>(({ theme, isOpen = false }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    padding: theme.spacing(1.5),
    maxWidth: 'calc(100% - 24px)',
    width: 'calc(100% - 24px)',
    boxShadow:
        isOpen ?
            `0px 0px 20px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)'}`
        :   'none',
    backdropFilter: 'blur(20px)',
    background: alpha(theme.palette.maskColor.bottom, 0.8),
    boxSizing: 'content-box',
}))

const ButtonGroupWrap = styled(ButtonGroup, {
    shouldForwardProp: (prop) => prop !== 'maskVariant',
})<{
    maskVariant?: MaskTabVariant
}>(({ theme, maskVariant = 'base' }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflowY: 'clip',
    flex: 1,
    gap: theme.spacing(1),
    ...(maskVariant === 'round' ?
        {
            padding: theme.spacing(0.5),
            background: theme.palette.maskColor.input,
            borderRadius: 18,
        }
    : maskVariant === 'flexible' ?
        {
            background: 'transparent',
            borderRadius: 0,
        }
    :   {
            marginTop: theme.spacing(-1),
            paddingTop: theme.spacing(1),
            background: 'transparent',
            borderRadius: 0,
        }),
}))

const FlexButtonGroupWrap = styled(ButtonGroup, {
    shouldForwardProp: (prop) => prop !== 'maskVariant' && prop !== 'isOpen' && prop !== 'isOverflow',
})<{
    maskVariant?: MaskTabVariant
    isOpen?: boolean
    isOverflow?: boolean
}>(({ theme, maskVariant = 'base', isOpen = false, isOverflow = false }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexWrap: isOpen ? 'wrap' : 'nowrap',
    overflow: 'hidden',
    flex: 1,
    maxWidth: '100%',
    paddingRight: isOpen ? defaultTabSize : 0,
    gap: maskVariant !== 'base' ? theme.spacing(1) : 0,
    borderRadius: 0,
    background:
        !isOpen && isOverflow ?
            theme.palette.mode === 'light' ?
                `linear-gradient(270deg, rgba(255,255,255,1) ${defaultTabSize}px, rgba(223, 229, 244, 0.8) ${defaultTabSize}px, rgba(244, 247, 254, 0) 72px)`
            :   `linear-gradient(270deg, transparent ${defaultTabSize}px, rgba(49, 49, 49, 0.8) ${defaultTabSize}px, rgba(23, 23, 23, 0) 72px)`
        :   'transparent',
}))

const tabMapping: {
    [key in MaskTabVariant]: ComponentType<any>
} = {
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
export function MaskTabList(props: MaskTabListProps) {
    const context = useTabContext()
    const classes = props.classes

    const [open, handleToggle] = useState(false)
    const [isTabsOverflow, setIsTabsOverflow] = useState(false)
    const [firstId, setFirstTabId] = useState<string | undefined>(context?.value)
    const innerElementRef = useRef<HTMLDivElement>(undefined)
    const anchorRef = useRef<HTMLDivElement>(null)
    const flexPanelRef = useRef(null)
    const { width } = useWindowSize()

    if (context === null) throw new TypeError('No TabContext provided')

    const { onChange, variant = 'base', hideArrowButton, ref, ...rest } = props

    useImperativeHandle(ref, () => innerElementRef.current)

    // #region hide tab should up to first when chick
    const innerRef = useCallback((element: HTMLDivElement | null) => {
        if (!element) return
        setIsTabsOverflow(element.scrollWidth >= element.clientWidth + defaultTabSize)
        innerElementRef.current = element
    }, [])
    {
        const [oldWidth, setOldWidth] = useState(width)
        if (oldWidth !== width) {
            setOldWidth(width)
            innerRef(innerElementRef.current || null)
        }
    }
    // #endregion

    const children = Children.map(props.children, (child) => {
        if (!isValidElement(child)) throw new TypeError('Invalided Children')
        const childProps: any = child.props
        const extra = {
            'aria-controls': getPanelId(context, childProps.value),
            id: getTabId(context, childProps.value),
            selected: childProps.value === context.value,
            className: childProps.className,
            onChange: (event: object, value: string, visitable?: boolean) => {
                handleToggle(false)
                props.onChange(event, value)
                if (variant === 'flexible' && !visitable) {
                    setFirstTabId(value)
                }
            },
            disabled: childProps.disabled,
        }

        if (child.type !== Tab) return child

        if (variant === 'flexible') {
            Object.assign(extra, {
                // if move tab to first in flexible tabs
                isVisitable: (top: number, right: number) => {
                    const anchor = anchorRef.current?.getBoundingClientRect()
                    return right <= (anchor?.right ?? 0) - defaultTabSize && top - (anchor?.top ?? 0) < defaultTabSize
                },
            })
        }
        const C = tabMapping[variant]
        return (
            <C value={childProps.value} {...extra}>
                {childProps.label}
            </C>
        )
    })

    // #region hide tab should up to first when chick
    const flexibleTabs = useMemo(() => {
        if (variant !== 'flexible') return null
        return children?.sort((a, b) => {
            if (a.props.value === firstId) return -1
            if (b.props.value === firstId) return 1
            return 0
        })
    }, [firstId, children])
    // #endregion

    // #region Should close panel when click other area
    useClickAway(flexPanelRef, (event) => {
        if (variant !== 'flexible') return
        const { left, right, top, bottom } = innerElementRef.current?.getBoundingClientRect() ?? {
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
        }
        const pointerX = (event as MouseEvent).x ?? 0
        const pointerY = (event as MouseEvent).y ?? 0

        if (pointerX > right || pointerX < left || pointerY < top || pointerY > bottom) handleToggle(false)
    })
    // #endregion

    if (variant === 'flexible') {
        return (
            <Box position="relative">
                <ButtonGroupWrap
                    maskVariant={variant}
                    ref={anchorRef}
                    style={{ visibility: 'hidden', height: defaultTabSize }}
                />
                <FlexibleButtonGroupPanel isOpen={!!(open && isTabsOverflow)} ref={flexPanelRef}>
                    <FlexButtonGroupWrap
                        maskVariant={variant}
                        isOpen={open}
                        isOverflow={!!(isTabsOverflow && !hideArrowButton)}
                        {...rest}
                        ref={innerRef}
                        role="tablist">
                        {flexibleTabs}
                        {(isTabsOverflow || open) && !hideArrowButton ?
                            <ArrowButtonWrap
                                className={classes?.arrowButton}
                                variant="text"
                                size="small"
                                aria-controls={open ? 'split-button-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-label="select tabs list"
                                aria-haspopup="menu"
                                onClick={() => handleToggle(!open)}>
                                <ArrowBackIosNewIconWrap
                                    sx={{ transform: open ? 'rotate(90deg)' : 'rotate(270deg)' }}
                                />
                            </ArrowButtonWrap>
                        :   null}
                    </FlexButtonGroupWrap>
                </FlexibleButtonGroupPanel>
            </Box>
        )
    }

    return (
        <ButtonGroupWrap maskVariant={variant} {...rest} ref={innerRef} role="tablist">
            {children}
        </ButtonGroupWrap>
    )
}

MaskTabList.displayName = 'MaskTabList'
