import { useMemo, useState } from 'react'
import { useWindowScroll, useWindowSize } from 'react-use'
import { makeStyles, Paper } from '@material-ui/core'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { EthereumAccountButton } from '../../web3/UI/EthereumAccountButton'
import { EthereumMaskBalanceButton } from '../../web3/UI/EthereumMaskBalanceButton'
import { useStylesExtends } from '../custom-ui-helper'

const STICKY_POSITION = 300
const STICKY_ANIMATION_DISTANCE = 150

const useStyle = makeStyles((theme) => {
    return {
        root: {
            borderRadius: 0,
            height: 54,
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
            height: 54,
            display: 'flex',
            alignItems: 'center',
        },
        left: {
            display: 'flex',
            justifyContent: 'center',
            padding: '0 10px',
            boxSizing: 'border-box',
            ['@media (min-width: 600)']: {
                padding: '0 5px',
            },
        },
        right: {
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
        maskButton: {
            marginRight: theme.spacing(1),
        },
        etherButton: {},
    }
})

export interface ToolbarProps extends withClasses<never> {}

export function Toolbar(props: ToolbarProps) {
    const classes = useStylesExtends(useStyle(), props)

    const [float, setFloat] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    //#region compute toolbar status according to scroll position
    const { y } = useWindowScroll()
    const isSticky = y - STICKY_POSITION > 0
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
        <Paper className={classes.root} elevation={0}>
            <div
                className={isSticky ? classes.rootSticky : ''}
                style={{ opacity: isSticky ? (y - STICKY_POSITION) / STICKY_ANIMATION_DISTANCE : 1 }}>
                <div className={classes.content} style={{ left, width }}>
                    <div className={classes.left} style={{ width: menuWidth }}>
                        <MaskbookIcon classes={{ root: classes.logo }} />
                    </div>
                    <div className={classes.right} style={{ width: mainWidth }}>
                        <EthereumMaskBalanceButton classes={{ root: classes.maskButton }} />
                        <EthereumAccountButton classes={{ root: classes.accountButton }} />
                    </div>
                </div>
            </div>
        </Paper>
    )
}
