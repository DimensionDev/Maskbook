import { useCallback } from 'react'
import type { SourceType } from '@masknet/web3-shared-base'
import useStyles from './useStyles'
import { DataSourceSwitcher, FootnoteMenuOption } from '@masknet/shared'
import { CollectibleState } from './hooks/useCollectibleState'
import { SupportedProvider } from '../constants'

export function DataSourceSwitcherWrapper() {
    const { classes } = useStyles()
    const { setProvider, provider } = CollectibleState.useContainer()

    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setProvider(option.value as SourceType)
    }, [])

    return (
        <div className={classes.dataSourceSwitcherWrapper}>
            <DataSourceSwitcher
                classes={{
                    sourceNote: classes.sourceNote,
                }}
                showDataProviderIcon
                dataProvider={provider}
                dataProviders={SupportedProvider}
                onDataProviderChange={onDataProviderChange}
            />
        </div>
    )
}
