import classNames from 'classnames'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, { disabled }) => ({
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
            transform: 'scale(1.02) translateY(-2px)',
            background: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.common.black,
            boxShadow: theme.palette.mode === 'light' ? '0px 5px 8px rgba(0, 0, 0, 0.05)' : 'none',
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
    },
    tooltip: {
        backgroundColor: '#111432',
    },
    arrow: {
        color: '#111432',
    },
    recommendFeatureApplicationBox: {
        width: 225,
        minWidth: 225,
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
}))

interface ApplicationEntryProps {
    icon: React.ReactNode
    title: React.ReactNode
    disabled?: boolean
    recommendFeature?: Plugin.SNSAdaptor.ApplicationEntry['recommendFeature']
    tooltipHint?: string | React.ReactElement
    onClick: () => void
}

export function ApplicationEntry(props: ApplicationEntryProps) {
    const { title, onClick, disabled = false, icon, tooltipHint, recommendFeature } = props
    const { classes } = useStyles({ disabled })
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
                placement: 'top',
            }}
            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
            placement="top"
            arrow
            disableHoverListener={!tooltipHint}
            title={<Typography>{tooltipHint}</Typography>}>
            {jsx}
        </ShadowRootTooltip>
    ) : (
        jsx
    )
}
