import { LeftArrowIcon, RightArrowIcon, GearSettingsIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classnames from 'classnames'
import { throttle } from 'lodash-unified'
import { HTMLProps, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const TAB_WIDTH = 126
const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        position: 'relative',
        backgroundColor: theme.palette.background.default,
        '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: theme.palette.divider,
            zIndex: 0,
        },
    },
    track: {
        flexGrow: 1,
        display: 'flex',
        overflow: 'auto',
        'scrollbar-width': 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    button: {
        height: 35,
        minWidth: TAB_WIDTH,
        padding: theme.spacing(0, 2.5),
        borderRadius: 0,
        flexShrink: 0,
        border: '1px solid transparent',
    },
    normal: {
        boxSizing: 'border-box',
        color: `${theme.palette.text.secondary} !important`,
        backgroundColor: theme.palette.background.default,
        border: '1px solid transparent',
        '&:hover': {
            color: `${theme.palette.text.primary} !important`,
            backgroundColor: theme.palette.background.default,
        },
    },
    selected: {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.background.paper,
        '&:hover': {
            borderBottomColor: theme.palette.background.paper,
            backgroundColor: theme.palette.background.paper,
        },
        position: 'relative',
        zIndex: 10,
        '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: theme.palette.background.paper,
        },
    },
    controllers: {
        display: 'flex',
        flexGrow: 0,
        alignItems: 'center',
        borderLeft: `1px solid ${theme.palette.divider}`,
    },
    controller: {
        display: 'flex',
        minWidth: 35,
        color: theme.palette.text.primary,
        border: 'none',
        width: 35,
        height: 35,
        borderRadius: 0,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            border: 'none !important',
            borderBottomColor: theme.palette.divider,
            color: `${theme.palette.text.primary} !important`,
            backgroundColor: theme.palette.background.paper,
        },
        '&[disabled]': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))

interface TabOption<T> {
    id: T
    label: string
}

export interface ConcealableTabsProps<T> extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
    tabs: TabOption<T>[]
    selectedId?: T
    onChange?(id: T): void
    tail?: ReactNode
    openDialog?: () => void
}

export function ConcealableTabs<T extends number | string>({
    className,
    tabs,
    selectedId,
    tail,
    onChange,
    openDialog,
    ...rest
}: ConcealableTabsProps<T>) {
    const { classes } = useStyles()
    const [overflow, setOverflow] = useState(false)

    const trackRef = useRef<HTMLDivElement>(null)
    const [reachedLeftEdge, setReachedLeftEdge] = useState(false)
    const [reachedRightEdge, setReachedRightEdge] = useState(false)

    useLayoutEffect(() => {
        const tabList = trackRef.current
        if (!tabList) return
        const isWider = tabList.scrollWidth > tabList.offsetWidth
        setOverflow(isWider)

        if (!isWider) return
        const detectScrollStatus = throttle(() => {
            const reachedRight = tabList.scrollWidth - tabList.offsetWidth <= tabList.scrollLeft
            const reachedLeft = tabList.scrollLeft === 0
            setReachedRightEdge(reachedRight)
            setReachedLeftEdge(reachedLeft)
        }, 100)

        detectScrollStatus()
        tabList.addEventListener('scroll', detectScrollStatus)
        return () => {
            tabList.removeEventListener('scroll', detectScrollStatus)
        }
    }, [])

    useEffect(() => {
        if (selectedId === undefined && tabs.length) {
            onChange?.(tabs[0].id)
        }
    }, [selectedId === undefined, tabs.length > 0, onChange])

    const slide = useCallback((toLeft: boolean) => {
        const tabList = trackRef.current
        if (!tabList) return
        const scrolled = Math.round(tabList.scrollLeft / TAB_WIDTH)
        tabList.scrollTo({ left: TAB_WIDTH * (scrolled + (toLeft ? 1 : -1)), behavior: 'smooth' })
    }, [])

    return (
        <div className={classnames(className, classes.container)} {...rest}>
            <div className={classes.track} ref={trackRef}>
                {tabs.map((tab) => (
                    <Button
                        disableRipple
                        key={tab.id}
                        className={classnames(
                            classes.button,
                            selectedId === tab.id ? classes.selected : classes.normal,
                        )}
                        role="button"
                        onClick={() => {
                            onChange?.(tab.id)
                        }}>
                        {tab.label}
                    </Button>
                ))}
            </div>
            {overflow || tail ? (
                <div className={classes.controllers}>
                    {overflow ? (
                        <>
                            <Button
                                disableRipple
                                className={classnames(classes.normal, classes.controller)}
                                disabled={reachedLeftEdge}
                                onClick={() => {
                                    slide(false)
                                }}>
                                <LeftArrowIcon color="inherit" />
                            </Button>
                            <Button
                                disableRipple
                                disabled={reachedRightEdge}
                                className={classnames(classes.normal, classes.controller)}
                                onClick={() => {
                                    slide(true)
                                }}>
                                <RightArrowIcon color="inherit" />
                            </Button>
                            <Button
                                disableRipple
                                disabled={reachedRightEdge}
                                onClick={openDialog}
                                className={classnames(classes.normal, classes.controller)}>
                                <GearSettingsIcon />
                            </Button>
                        </>
                    ) : null}
                    {tail}
                </div>
            ) : null}
        </div>
    )
}
