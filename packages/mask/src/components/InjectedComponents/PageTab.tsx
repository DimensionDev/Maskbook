import { makeStyles } from '@masknet/theme'
import type { Plugin } from '@masknet/plugin-infra'
import { PageTabItem } from './PageTabItem'
import { Typography } from '@mui/material'
import { useI18N } from '../../utils'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
}))

export interface PageTabProps {
    tabs: ({ pluginID: string } & Plugin.SNSAdaptor.ProfileTab<Web3Helper.ChainIdAll>)[]
    selectedTab?: Plugin.SNSAdaptor.ProfileTab<Web3Helper.ChainIdAll>
    onChange?: (tag: Plugin.SNSAdaptor.ProfileTab<Web3Helper.ChainIdAll>) => void
}

export function PageTab(props: PageTabProps) {
    const { tabs, selectedTab, onChange } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    if (!tabs.length) {
        return (
            <Typography variant="body2" color="textPrimary" align="center" sx={{ paddingTop: 8 }}>
                {t('web3_tab_hint')}
            </Typography>
        )
    }
    return (
        <div className={classes.root}>
            {tabs.map((x) => (
                <PageTabItem
                    pluginID={x.pluginID}
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
