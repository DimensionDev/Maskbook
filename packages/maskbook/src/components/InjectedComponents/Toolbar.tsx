import { makeStyles, Paper } from '@material-ui/core'
import { useMemo } from 'react'
import { useWindowSize } from 'react-use'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { EthereumAccountButton } from '../../web3/UI/EthereumAccountButton'
import { EthereumMaskBalanceButton } from '../../web3/UI/EthereumMaskBalanceButton'
import { useStylesExtends } from '../custom-ui-helper'

const useStyle = makeStyles((theme) => {
    return {
        root: {
            borderRadius: 0,
            height: 54,
            position: 'relative',
            borderBottom: `1px solid ${theme.palette.divider}`,
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

    return (
        <Paper className={classes.root} elevation={0}>
            <div className={classes.content} style={{ left, width }}>
                <div className={classes.left} style={{ width: menuWidth }}>
                    <MaskbookIcon classes={{ root: classes.logo }} />
                </div>
                <div className={classes.right} style={{ width: mainWidth }}>
                    <EthereumMaskBalanceButton classes={{ root: classes.maskButton }} />
                    <EthereumAccountButton classes={{ root: classes.accountButton }} />
                </div>
            </div>
        </Paper>
    )
}
