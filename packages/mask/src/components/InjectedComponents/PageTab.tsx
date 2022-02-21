import { makeStyles } from '@masknet/theme'
import type { Plugin } from '@masknet/plugin-infra'
import { PageTabItem } from './PageTabItem'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
}))

export interface PageTabProps {
    tabs: Plugin.SNSAdaptor.ProfileTab[]
    selectedTab?: Plugin.SNSAdaptor.ProfileTab
    onChange?: (tag: Plugin.SNSAdaptor.ProfileTab) => void
}

export function PageTab(props: PageTabProps) {
    const { tabs, selectedTab, onChange } = props
    const { classes } = useStyles()

    if (!tabs.length) {
        return (
            <Typography variant="body2" color="textPrimary">
                No address found
            </Typography>
        )
    }
    return (
        <div className={classes.root}>
            {tabs.map((x) => (
                <PageTabItem
                    key={x.ID}
                    tab={x}
                    selected={selectedTab?.ID === x.ID}
                    onClick={(tab) => {
                        onChange?.(tab)
                    }}
                />
            ))}
        </div>
    )
}
