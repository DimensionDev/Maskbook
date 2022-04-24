import classNames from 'classnames'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'

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
    nextIdVerification?: {
        toolTipHint: string
        isNextIDVerify: boolean | undefined
        isSNSConnectToCurrentPersona: boolean | undefined
        onNextIDVerify(): void
    }
    onClick: () => void
}

export function ApplicationEntry(props: Props) {
    const { title, onClick, disabled: _disabled = false, icon, nextIdVerification } = props
    const disabled =
        nextIdVerification &&
        (nextIdVerification?.isNextIDVerify === undefined || !nextIdVerification?.isSNSConnectToCurrentPersona)
            ? true
            : _disabled
    const tooltip =
        nextIdVerification?.isSNSConnectToCurrentPersona === false ? nextIdVerification?.toolTipHint : undefined
    const { classes } = useStyles()
    const jsx = (
        <div
            className={classNames(classes.applicationBox, disabled ? classes.disabled : classes.applicationBoxHover)}
            onClick={
                disabled
                    ? () => {}
                    : !nextIdVerification?.isNextIDVerify && nextIdVerification
                    ? nextIdVerification?.onNextIDVerify
                    : onClick
            }>
            <div className={classes.iconWrapper}>{icon}</div>
            <Typography className={classes.title} color="textPrimary">
                {title}
            </Typography>
        </div>
    )
    return tooltip ? (
        <ShadowRootTooltip
            PopperProps={{
                disablePortal: true,
            }}
            placement="top"
            arrow
            disableHoverListener={!tooltip}
            title={<Typography>{tooltip}</Typography>}>
            {jsx}
        </ShadowRootTooltip>
    ) : (
        jsx
    )
}
