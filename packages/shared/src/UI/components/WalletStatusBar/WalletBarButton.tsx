import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { Button, CircularProgress } from '@mui/material'
import classNames from 'classnames'
import { useState } from 'react'
import { useSharedI18N } from '../../../locales'

interface WalletButtonProps extends withClasses<'root'> {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    color?: 'warning'
    loading?: boolean
    disabled?: boolean
    action?: () => Promise<void>
    title?: string | React.ReactElement | React.ReactNode
    waiting?: string | React.ReactElement | React.ReactNode
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
        padding: 11,
    },
}))

type ActionButtonPromiseState = 'init' | 'complete' | 'wait' | 'fail'

export function WalletButton(props: WalletButtonProps) {
    const { color, startIcon, endIcon, loading = false, disabled = false, action, title, waiting } = props
    const classes = useStylesExtends(useStyles({ color }), props)
    const t = useSharedI18N()

    const [state, setState] = useState<ActionButtonPromiseState>('init')
    const run = () => {
        setState('wait')
        action?.().then(
            () => {
                setState('complete')
            },
            (error) => {
                if (error.message.includes('Switch Chain Error')) setState('init')
                else setState('fail')
            },
        )
    }
    return (
        <Button
            startIcon={startIcon}
            endIcon={endIcon}
            variant="contained"
            className={classNames(classes.button, classes.root)}
            fullWidth
            disabled={loading || disabled || state === 'wait' || state === 'complete'}
            onClick={run}>
            {loading || state === 'wait' ? <CircularProgress size={24} className={classes.progress} /> : null}
            {(state === 'wait' ? waiting : undefined) ?? title}
        </Button>
    )
}
