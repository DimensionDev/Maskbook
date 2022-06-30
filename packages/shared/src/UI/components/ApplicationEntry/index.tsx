import classNames from 'classnames'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles<{ disabled: boolean; iconFilterColor?: string }>()(
    (theme, { disabled, iconFilterColor }) => ({
        applicationBox: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.maskColor.bg,
            borderRadius: '8px',
            height: 100,
        },
        applicationBoxHover: {
            cursor: 'pointer',
            '&:hover': {
                transform: 'scale(1.02) translateY(-2px)',
                background: theme.palette.maskColor.bottom,
                boxShadow:
                    theme.palette.mode === 'light'
                        ? '0px 5px 8px rgba(0, 0, 0, 0.05)'
                        : '0px 0px 20px rgba(255, 255, 255, 0.12)',
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
            cursor: 'default !important',
            pointerEvent: 'none',
        },
        iconWrapper: {
            '> *': {
                width: 36,
                height: 36,
            },
            ...(iconFilterColor
                ? { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`, backdropFilter: 'blur(16px)' }
                : {}),
        },
        tooltip: {
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
        },
        tooltipHint: {
            fontSize: 14,
            color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.common.black,
        },
        arrow: {
            color: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
        },
        recommendFeatureApplicationBox: {
            width: 255,
            minWidth: 255,
            height: 97,
            marginRight: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            borderRadius: 8,
        },
        recommendFeatureAppIconWrapper: {
            marginRight: 12,
            '> *': {
                width: 48,
                height: 48,
            },
        },
        recommendFeatureAppListItemName: {
            fontSize: 14,
            fontWeight: 500,
            cursor: disabled ? 'default' : 'pointer',
            color: theme.palette.common.white,
        },
        recommendFeatureAppListItemDescription: {
            fontSize: 12,
            fontWeight: 500,
            cursor: disabled ? 'default' : 'pointer',
            color: theme.palette.common.white,
        },
    }),
)

interface ApplicationEntryProps {
    icon: React.ReactNode
    title: React.ReactNode
    disabled?: boolean
    recommendFeature?: Plugin.SNSAdaptor.ApplicationEntry['recommendFeature']
    iconFilterColor?: string
    tooltipHint?: string | React.ReactElement
    onClick: () => void
}

export function ApplicationEntry(props: ApplicationEntryProps) {
    const { title, onClick, disabled = false, icon, tooltipHint, recommendFeature, iconFilterColor } = props
    const { classes } = useStyles({ disabled, iconFilterColor })
    const jsx = recommendFeature ? (
        <div
            style={{
                background: recommendFeature.backgroundGradient,
            }}
            className={classNames(
                classes.recommendFeatureApplicationBox,
                disabled ? classes.disabled : classes.applicationBoxHover,
            )}
            onClick={disabled ? () => {} : onClick}>
            <div className={classes.recommendFeatureAppIconWrapper}>{icon}</div>
            <div>
                <Typography className={classes.recommendFeatureAppListItemName}>{title}</Typography>
                <Typography className={classes.recommendFeatureAppListItemDescription}>
                    {recommendFeature.description}
                </Typography>
            </div>
        </div>
    ) : (
        <div
            className={classNames(classes.applicationBox, disabled ? classes.disabled : classes.applicationBoxHover)}
            onClick={disabled ? () => {} : onClick}>
            <div className={classes.iconWrapper}>{icon}</div>
            <Typography className={classes.title} color="textPrimary">
                {title}
            </Typography>
        </div>
    )
    return tooltipHint ? (
        <ShadowRootTooltip
            PopperProps={{
                disablePortal: true,
                placement: recommendFeature ? 'bottom' : 'top',
            }}
            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
            placement={recommendFeature ? 'bottom' : 'top'}
            arrow
            disableHoverListener={!tooltipHint}
            title={<Typography className={classes.tooltipHint}>{tooltipHint}</Typography>}>
            {jsx}
        </ShadowRootTooltip>
    ) : (
        jsx
    )
}
