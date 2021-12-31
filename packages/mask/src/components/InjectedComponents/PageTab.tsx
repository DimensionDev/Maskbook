import { makeStyles } from '@masknet/theme'
import type { Plugin } from '@masknet/plugin-infra'
import { PageTabItem } from './PageTabItem'

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
