import { makeStyles } from '@material-ui/core'
import { useMemo } from 'react'
import { useEffectOnce, useWindowScroll, useWindowSize } from 'react-use'
import { Toolbar } from './Toolbar'

export const TOOLBAR_STICKY_POSITION = 300
export const TOOLBAR_STICKY_ANIMATION_DISTANCE = 150
export const TOOLBAR_HEIGHT = 54

const useStyles = makeStyles((theme) => {
    return {
        root: {
            height: TOOLBAR_HEIGHT,
        },
        rootSticky: {
            zIndex: 1,
            left: '0 !important',
            width: '100% !important',
            position: 'fixed',
            backgroundColor: theme.palette.background.paper,
            boxShadow: `${
                theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                    : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
            }`,
        },
        left: {
            height: TOOLBAR_HEIGHT,
        },
        right: {
            height: TOOLBAR_HEIGHT,
        }
    }
})

export interface ToolbarAtTwitterProps {}

export function ToolbarAtTwitter(props: ToolbarAtTwitterProps) {
    const classes = useStyles()

    // inject global css
    useEffectOnce(() => {
        const sidebarResetStyle = document.createElement('style')
        sidebarResetStyle.innerHTML = `
            [data-testid="sidebarColumn"] > div:first-child > div:nth-child(2) > div:first-child > div:first-child > div:first-child {
                padding-top: 10px;
            }

            [data-testid="sidebarColumn"] > div:first-child > div:nth-child(2) > div:first-child > div:first-child > div:first-child > div:nth-child(2) {
                display: none;
            }
        `
        document.querySelector('head')?.appendChild(sidebarResetStyle)
    })

    //#region compute toolbar status according to scroll position
    const { y } = useWindowScroll()
    const isSticky = y - TOOLBAR_STICKY_POSITION > 0
    //#endregion

    //#region resizing toolbar
    const { width: windowWidth } = useWindowSize()
    const { left, width, menuWidth, mainWidth } = useMemo(() => {
        const menu = document.querySelector<HTMLDivElement>('[role="banner"] > div:first-child > div:first-child')
        const main = document.querySelector<HTMLDivElement>('[role="main"] > div:first-child')
        const { width: menuWidth = 0, left: menuLeft = 0 } = menu ? menu.getBoundingClientRect() : {}
        const { width: mainWidth = 0 } = main ? main.getBoundingClientRect() : {}
        return {
            left: menuLeft,
            width: menuWidth + mainWidth,
            menuWidth,
            mainWidth,
        }
    }, [windowWidth])
    //#endregion

    return (
        <Toolbar
            classes={classes}
            isSticky={isSticky}
            opacity={isSticky ? (y - TOOLBAR_STICKY_POSITION) / TOOLBAR_STICKY_ANIMATION_DISTANCE : 1}
            left={left}
            right="auto"
            width={width}
            leftWidth={menuWidth}
            rightWidth={mainWidth}
        />
    )
}
