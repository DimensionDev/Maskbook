import { makeStyles, Paper } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { EthereumAccountButton } from '../../web3/UI/EthereumAccountButton'
import { EthereumMaskBalanceButton } from '../../web3/UI/EthereumMaskBalanceButton'
import { useStylesExtends } from '../custom-ui-helper'
import { BreakdownDialog } from './BreakdownDialog'

const useStyle = makeStyles((theme) => {
    return {
        root: {
            borderRadius: 0,
            position: 'relative',
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        rootSticky: {
            zIndex: 1,
            left: '0 !important',
            width: '100% !important',
            position: 'fixed',
        },
        content: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        },
        left: {
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

export interface ToolbarProps extends withClasses<'root' | 'rootSticky' | 'left' | 'right'> {
    opacity: number
    left: number | 'auto'
    right: number | 'auto'
    width: number
    leftWidth: number
    rightWidth: number
    isSticky: boolean
}

export function Toolbar(props: ToolbarProps) {
    const { opacity, left, right, width, leftWidth, rightWidth, isSticky } = props

    const classes = useStylesExtends(useStyle(), props)

    //#region breakdown dialog
    const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
    const onMaskbookIconClicked = useCallback(() => {
        setBreakdownDialogOpen(true)
    }, [])
    //#endregion

    return (
        <>
            <Paper className={classes.root} elevation={0}>
                <div className={isSticky ? classes.rootSticky : ''} style={{ opacity }}>
                    <div className={classes.content} style={{ left, right, width }}>
                        <div className={classes.left} style={{ width: leftWidth }}>
                            <MaskbookIcon classes={{ root: classes.logo }} />
                        </div>
                        <div className={classes.right} style={{ width: rightWidth }}>
                            <EthereumMaskBalanceButton classes={{ root: classes.maskButton }} ButtonProps={{ onClick: onMaskbookIconClicked }} />
                            <EthereumAccountButton classes={{ root: classes.accountButton }} />
                        </div>
                    </div>
                </div>
            </Paper>
            <BreakdownDialog open={breakdownDialogOpen} />
        </>
    )
}
