import { useChainId, useCurrentWeb3NetworkPluginID, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { Button, CircularProgress } from '@mui/material'
import classNames from 'classnames'
import { useState } from 'react'
import { useSharedI18N } from '../../../locales'
import type { WalletButtonActionProps } from './types'

interface WalletButtonProps extends withClasses<'root'> {
    actionProps?: WalletButtonActionProps
}

const useStyles = makeStyles<{ color?: 'warning' }>()((theme, props) => ({
    progress: {
        color: MaskColorVar.twitterButtonText,
        position: 'absolute',
        top: theme.spacing(1),
        left: `calc(50%-${theme.spacing(1)})`,
    },
    button: {
        backgroundColor: props.color === 'warning' ? MaskColorVar.errorPlugin : '',
        color: props.color === 'warning' ? '#FFFFFF' : '',
        '&:hover': {
            backgroundColor: props.color === 'warning' ? MaskColorVar.errorPlugin : '',
        },
        lineHeight: '18px',
        fontSize: 14,
        height: 40,
    },
}))

type ActionButtonPromiseState = 'init' | 'complete' | 'wait' | 'fail'

export function WalletButton(props: WalletButtonProps) {
    const { actionProps } = props
    const classes = useStylesExtends(useStyles({ color: actionProps?.color }), props)
    const t = useSharedI18N()
    const [state, setState] = useState<ActionButtonPromiseState>('init')
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const expectedConnection = useWeb3Connection(currentPluginId)
    const chainId = useChainId(currentPluginId)

    const run = () => {
        setState('wait')
        actionProps?.action?.().then(
            () => {
                setState('complete')
            },
            (error) => {
                if (error.message.includes('Switch Chain Error')) setState('init')
                else setState('fail')
            },
        )
    }
    if (!actionProps)
        return (
            <Button
                variant="contained"
                className={classes.button}
                fullWidth
                onClick={() => expectedConnection.connect({ chainId })}>
                {t.change()}
            </Button>
        )
    return (
        <Button
            startIcon={actionProps?.startIcon}
            endIcon={actionProps?.endIcon}
            variant="contained"
            className={classNames(classes.button, classes.root)}
            fullWidth
            disabled={actionProps?.loading || actionProps?.disabled || state === 'wait' || state === 'complete'}
            onClick={run}>
            {actionProps?.loading || state === 'wait' ? (
                <CircularProgress size={24} className={classes.progress} />
            ) : null}
            {(state === 'wait' ? actionProps?.waiting : undefined) ?? actionProps?.title}
        </Button>
    )
}
