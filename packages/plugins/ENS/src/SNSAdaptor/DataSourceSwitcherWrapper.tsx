import { useCallback } from 'react'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import useStyles from './useStyles'
import { DataSourceSwitcher, FootnoteMenuOption } from '@masknet/shared'
import { DataProviderIconUI } from './DataProviderIconUI'
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
                DataProviderIconUI={DataProviderIconUI}
                resolveDataProviderName={resolveSourceTypeName}
                showDataProviderIcon
                dataProvider={provider}
                dataProviders={SupportedProvider}
                onDataProviderChange={onDataProviderChange}
            />
        </div>
    )
}
