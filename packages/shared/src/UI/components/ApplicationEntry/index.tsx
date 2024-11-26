import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip, useBoundedPopperProps } from '@masknet/theme'
import { Button, Typography } from '@mui/material'

const useStyles = makeStyles<{ disabled: boolean; iconFilterColor?: string }>()(
    (theme, { disabled, iconFilterColor }) => ({
        applicationBox: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.maskColor.bg,
            borderRadius: '8px',
            height: 104,
            gap: theme.spacing(1),
            padding: 4,
            boxSizing: 'border-box',
        },
        applicationBoxHover: {
            cursor: 'pointer',
            '&:hover': {
                transform: 'scale(1.02) translateY(-2px)',
                background: theme.palette.maskColor.bottom,
                boxShadow:
                    theme.palette.mode === 'light' ?
                        '0px 5px 8px rgba(0, 0, 0, 0.05)'
                    :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
            },
        },
        title: {
            fontSize: 14,
            height: 36,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: '18px',
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
            color: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
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
            boxSizing: 'content-box',
        },
        recommendFeatureAppIconWrapper: {
            marginRight: 12,
            '> *': {
                width: '48px !important',
                height: '48px !important',
            },
        },
        recommendFeatureAppListItemName: {
            textAlign: 'left',
            fontSize: 18,
            fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer',
            color: theme.palette.common.white,
        },
        recommendFeatureAppListItemDescription: {
            textAlign: 'left',
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
    recommendFeature?: Plugin.SiteAdaptor.ApplicationEntry['recommendFeature']
    iconFilterColor?: string
    tooltipHint?: React.ReactNode
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
    const jsx =
        recommendFeature ?
            <Button
                variant="text"
                // do not change to sx. the hover image will be changed in applicationBoxHover
                style={{ background: recommendFeature.backgroundGradient }}
                disabled={disabled}
                className={cx(
                    classes.recommendFeatureApplicationBox,
                    disabled ? classes.disabled : classes.applicationBoxHover,
                )}
                onClick={disabled ? undefined : onClick}>
                <div className={classes.recommendFeatureAppIconWrapper}>{icon}</div>
                <div>
                    <Typography className={classes.recommendFeatureAppListItemName}>{title}</Typography>
                    {secondTitle ?
                        <Typography className={classes.recommendFeatureAppListItemDescription}>
                            {secondTitle}
                        </Typography>
                    :   null}
                    <Typography className={classes.recommendFeatureAppListItemDescription}>
                        {recommendFeature.description}
                    </Typography>
                </div>
            </Button>
        :   <Button
                className={cx(classes.applicationBox, disabled ? classes.disabled : classes.applicationBoxHover)}
                onClick={disabled ? undefined : onClick}
                variant="text"
                disabled={disabled}>
                <div className={classes.iconWrapper}>{icon}</div>
                <TextOverflowTooltip
                    title={title}
                    as={ShadowRootTooltip}
                    arrow={false}
                    disableInteractive
                    componentsProps={{
                        tooltip: {
                            style: {
                                padding: 6,
                                fontSize: 10,
                            },
                        },
                    }}>
                    <Typography className={classes.title} color="textPrimary">
                        {title}
                    </Typography>
                </TextOverflowTooltip>
                {secondTitle ?
                    <Typography variant="body2" color="textSecondary">
                        {secondTitle}
                    </Typography>
                :   null}
            </Button>
    return tooltipHint && !disabled ?
            <ShadowRootTooltip
                PopperProps={{
                    ...popperProps,
                    disablePortal: true,
                    placement: recommendFeature ? 'bottom' : 'top',
                }}
                classes={{
                    arrow: classes.arrow,
                }}
                placement={recommendFeature ? 'bottom' : 'top'}
                arrow
                disableInteractive
                title={<Typography>{tooltipHint}</Typography>}>
                {jsx}
            </ShadowRootTooltip>
        :   jsx
}
