import classNames from 'classnames'
import type { Plugin } from '@masknet/plugin-infra'
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
    recommendFeatureApplicationBox: {
        width: 220,
        height: 97,
        cursor: 'pointer',
        display: 'flex',
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
        cursor: 'pointer',
        color: theme.palette.common.white,
    },
    recommendFeatureAppListItemDescription: {
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        color: theme.palette.common.white,
    },
}))

interface ApplicationEntryProps {
    icon: React.ReactNode
    title: React.ReactNode
    disabled?: boolean
    recommendFeature?: Plugin.SNSAdaptor.ApplicationEntry['recommendFeature']
    tooltipHint?: string
    onClick: () => void
}

export function ApplicationEntry(props: ApplicationEntryProps) {
    const { title, onClick, disabled = false, icon, tooltipHint, recommendFeature } = props
    const { classes } = useStyles()
    const jsx = recommendFeature ? (
        <div
            style={{
                background: recommendFeature.backgroundGradient,
            }}
            className={classNames(classes.recommendFeatureApplicationBox, disabled ? classes.disabled : '')}
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
            }}
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
