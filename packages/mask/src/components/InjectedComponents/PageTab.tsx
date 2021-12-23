import { useState } from 'react'
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
    onChange?: (tag: Plugin.SNSAdaptor.ProfileTab) => void
}

export function PageTab(props: PageTabProps) {
    const { tabs } = props
    const [selectedId, setSelectedId] = useState('')
    const { classes } = useStyles()

    return (
        <div className={classes.root}>
            {tabs.map((x) => (
                <PageTabItem
                    key={x.ID}
                    selected={x.ID === selectedId}
                    tab={x}
                    onClick={(tab) => {
                        setSelectedId(tab.ID)
                    }}
                />
            ))}
        </div>
    )
}
