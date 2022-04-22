import classNames from 'classnames'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { TooltipProps, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: '8px',
        height: 100,
    },
    applicationBoxHover: {
        cursor: 'pointer',
        '&:hover': {
            transform: 'scale(1.05) translateY(-4px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 10px 16px rgba(0, 0, 0, 0.1)' : 'none',
        },
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
    title: {
        fontSize: 15,
    },
    disabled: {
        opacity: 0.4,
        cursor: 'default',
        pointerEvent: 'none',
    },
    iconWrapper: {
        '> *': {
            width: 36,
            height: 36,
        },
    },
}))

interface Props {
    icon: React.ReactNode
    title: React.ReactNode
    disabled?: boolean
    toolTip?: string
    onClick: () => void
    tooltipProps?: Partial<TooltipProps>
    hint?: string | React.ReactElement
    nextIdVerifyToolTipHint?: string
}

export function ApplicationEntry(props: Props) {
    const {
        icon,
        title,
        onClick,
        disabled = false,
        tooltipProps = {
            placement: 'top',
            arrow: true,
        },
        hint = '',
        nextIdVerifyToolTipHint,
    } = props
    const { classes } = useStyles()
    const jsx = (
        <div
            className={classNames(classes.applicationBox, disabled ? classes.disabled : classes.applicationBoxHover)}
            onClick={disabled ? () => {} : onClick}>
            <div className={classes.iconWrapper}>{icon}</div>
            <Typography className={classes.title} color="textPrimary">
                {title}
            </Typography>
        </div>
    )
    return (
        <>
            {(hint && !disabled) || nextIdVerifyToolTipHint ? (
                <ShadowRootTooltip
                    title={<Typography>{nextIdVerifyToolTipHint ?? hint}</Typography>}
                    {...tooltipProps}
                    disableHoverListener={!nextIdVerifyToolTipHint}>
                    {jsx}
                </ShadowRootTooltip>
            ) : (
                jsx
            )}
        </>
    )
}
