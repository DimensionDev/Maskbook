import { makeStyles, IconButton } from '@material-ui/core'
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow'
import { useMemo, useState } from 'react'
import classNames from 'classnames'
import { useEffectOnce, useWindowScroll, useWindowSize, useLocation } from 'react-use'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { EthereumAccountButton } from '../../web3/UI/EthereumAccountButton'
import { EthereumMaskBalanceButton } from '../../web3/UI/EthereumMaskBalanceButton'
import { Toolbar } from './Toolbar'

export const TOOLBAR_STICKY_POSITION = 300
export const TOOLBAR_STICKY_ANIMATION_DISTANCE = 150
export const TOOLBAR_HEIGHT = 54

const useStyles = makeStyles((theme) => {
    return {
        root: {
            height: TOOLBAR_HEIGHT,
            borderRadius: 0,
            position: 'relative',
            borderBottom: `1px solid ${theme.palette.divider}`,
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
        content: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        },
        left: {
            height: TOOLBAR_HEIGHT,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 10px',
            boxSizing: 'border-box',
            ['@media (min-width: 600)']: {
                padding: '0 5px',
            },
        },
        right: {
            height: TOOLBAR_HEIGHT,
            display: 'flex',
            alignItems: 'center',
        },
        logo: {
            width: 36,
            height: 36,
        },
        accountButton: {
            marginLeft: theme.spacing(1),
        },
        maskBalanceButton: {
            marginRight: theme.spacing(1),
        },
        sizeButton: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        rotate: {
            transform: 'rotate(-180deg)',
        },
        rootStickyShrink: {
            left: '10px !important',
            position: 'fixed',
            backgroundColor: theme.palette.background.paper,
            height: TOOLBAR_HEIGHT,
        },
    }
})

export interface ToolbarAtTwitterProps {}

export function ToolbarAtTwitter(props: ToolbarAtTwitterProps) {
    const classes = useStyles()
    const location = useLocation()
    const isPhotoPage = /\/status\/\d+\/photo\/\d+$/.test(location.pathname ?? '')
    const [isExpand, setExpand] = useState(false)

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

    //#region resize toolbar
    const { width: windowWidth } = useWindowSize()
    const { left, right, width, menuWidth, mainWidth } = useMemo(() => {
        const menu = document.querySelector<HTMLDivElement>('[role="banner"] > div:first-child > div:first-child')
        const main = document.querySelector<HTMLDivElement>('[role="main"] > div:first-child')
        const { width: menuWidth = 0, left: menuLeft = 0 } = menu ? menu.getBoundingClientRect() : {}
        const { width: mainWidth = 0 } = main ? main.getBoundingClientRect() : {}
        return {
            left: menuLeft,
            right: 'auto',
            width: menuWidth + mainWidth,
            menuWidth,
            mainWidth,
        }
    }, [windowWidth])
    //#endregion

    // There's an animation effect when click button which would keep showing after expanded or shrinked,
    //  so re-render IconButton immediately when isExpand changes.
    const IconButtonMemo = useMemo(
        () => () => (
            <IconButton
                onClick={() => setExpand(!isExpand)}
                color="primary"
                className={classNames(classes.sizeButton, isExpand ? classes.rotate : '')}>
                <DoubleArrowIcon />
            </IconButton>
        ),
        [isExpand],
    )

    return isPhotoPage ? null : (
        <Toolbar classes={{ root: classes.root }}>
            <div
                className={isExpand ? (isSticky ? classes.rootSticky : '') : classes.rootStickyShrink}
                style={
                    isExpand
                        ? {
                              opacity: isSticky ? (y - TOOLBAR_STICKY_POSITION) / TOOLBAR_STICKY_ANIMATION_DISTANCE : 1,
                          }
                        : {}
                }>
                <div className={classes.content} style={isExpand ? { left, right, width } : {}}>
                    {isExpand ? (
                        <div className={classes.left} style={{ width: menuWidth }}>
                            <MaskbookIcon classes={{ root: classes.logo }} />
                        </div>
                    ) : null}
                    <div className={classes.right} style={isExpand ? { width: mainWidth } : {}}>
                        <EthereumMaskBalanceButton classes={{ root: classes.maskBalanceButton }} />
                        {isExpand ? <EthereumAccountButton classes={{ root: classes.accountButton }} /> : null}
                        <IconButtonMemo />
                    </div>
                </div>
            </div>
        </Toolbar>
    )
}
