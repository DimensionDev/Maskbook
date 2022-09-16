import { useCallback } from 'react'
import type { SourceType } from '@masknet/web3-shared-base'
import useStyles from './useStyles'
import { FootnoteMenuOption, SourceSwitcher } from '@masknet/shared'
import { CollectibleState } from './hooks/useCollectibleState'
import { SUPPORTED_SOURCE_TYPES } from '../constants'

export function SourceSwitcherWrapper() {
    const { classes } = useStyles()
    const { setProvider, provider } = CollectibleState.useContainer()

    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setProvider(option.value as SourceType)
    }, [])

    return (
        <div className={classes.sourceSwitcherWrapper}>
            <SourceSwitcher
                classes={{
                    sourceNote: classes.sourceNote,
                }}
                showSourceProviderIcon
                sourceType={provider}
                sourceTypes={SUPPORTED_SOURCE_TYPES}
                onSourceTypeChange={onDataProviderChange}
            />
        </div>
    )
}
