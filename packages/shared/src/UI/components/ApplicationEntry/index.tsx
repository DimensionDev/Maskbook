import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootTooltip, useBoundedPopperProps } from '@masknet/theme'
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
        title: {
            fontSize: 14,
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
            ...(iconFilterColor ? { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})` } : {}),
        },
        arrow: {
            marginLeft: '-12px',
            color: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
        },
        firstAreaArrow: {
            marginLeft: '12px !important',
        },
        recommendFeatureApplicationBox: {
            width: 257,
            minWidth: 257,
            height: 97,
            marginRight: 9.5,
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
                width: '48px !important',
                height: '48px !important',
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
    secondTitle?: React.ReactNode
    disabled?: boolean
    recommendFeature?: Plugin.SNSAdaptor.ApplicationEntry['recommendFeature']
    iconFilterColor?: string
    tooltipHint?: string | React.ReactElement
    onClick: () => void
}

export function ApplicationEntry(props: ApplicationEntryProps) {
    const {
        title,
        secondTitle,
        onClick,
        disabled = false,
        icon,
        tooltipHint,
        recommendFeature,
        iconFilterColor,
    } = props
    const { classes, cx } = useStyles({ disabled, iconFilterColor })
    const popperProps = useBoundedPopperProps()
    const jsx = recommendFeature ? (
        <div
            style={{
                background: recommendFeature.backgroundGradient,
            }}
            className={cx(
                classes.recommendFeatureApplicationBox,
                disabled ? classes.disabled : classes.applicationBoxHover,
            )}
            onClick={disabled ? () => {} : onClick}>
            <div className={classes.recommendFeatureAppIconWrapper}>{icon}</div>
            <div>
                <Typography className={classes.recommendFeatureAppListItemName}>{title}</Typography>
                {secondTitle ? (
                    <Typography className={classes.recommendFeatureAppListItemDescription}>{secondTitle}</Typography>
                ) : null}
                <Typography className={classes.recommendFeatureAppListItemDescription}>
                    {recommendFeature.description}
                </Typography>
            </div>
        </div>
    ) : (
        <div
            className={cx(classes.applicationBox, disabled ? classes.disabled : classes.applicationBoxHover)}
            onClick={disabled ? () => {} : onClick}>
            <div className={classes.iconWrapper}>{icon}</div>
            <Typography className={classes.title} color="textPrimary">
                {title}
            </Typography>
            {secondTitle ? (
                <Typography variant="body2" color="textSecondary">
                    {secondTitle}
                </Typography>
            ) : null}
        </div>
    )
    return tooltipHint ? (
        <ShadowRootTooltip
            PopperProps={{
                ...popperProps,
                disablePortal: true,
                placement: recommendFeature ? 'bottom' : 'top',
            }}
            classes={{
                arrow: cx(classes.arrow, recommendFeature?.isFirst ? classes.firstAreaArrow : ''),
            }}
            placement={recommendFeature ? 'bottom' : 'top'}
            arrow
            disableHoverListener={!tooltipHint}
            title={disabled ? null : <Typography>{tooltipHint}</Typography>}>
            {jsx}
        </ShadowRootTooltip>
    ) : (
        jsx
    )
}
