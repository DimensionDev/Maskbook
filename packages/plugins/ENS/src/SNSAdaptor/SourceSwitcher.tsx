import { useCallback } from 'react'
import type { SourceType } from '@masknet/web3-shared-base'
import { FootnoteMenuOption, SourceSwitcher as SourceSwitcherShared } from '@masknet/shared'
import { CollectibleState } from './hooks/useCollectibleState'
import { SUPPORTED_SOURCE_TYPES } from '../constants'
import { makeStyles } from '@masknet/theme'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme) => {
    return {
        sourceSwitcher: {
            display: 'flex',
            justifyContent: 'right',
            marginBottom: 13,
        },
        sourceNote: {
            fontSize: 14,
            fontWeight: '400 !important',
            color: theme.palette.maskColor.secondaryDark,
        },
    }
})

export function SourceSwitcher() {
    const { classes } = useStyles({})
    const { setSourceType, sourceType } = CollectibleState.useContainer()

    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setSourceType(option.value as SourceType)
    }, [])

    return (
        <div className={classes.sourceSwitcher}>
            <SourceSwitcherShared
                classes={{
                    sourceNote: classes.sourceNote,
                }}
                sourceType={sourceType}
                sourceTypes={SUPPORTED_SOURCE_TYPES}
                onSourceTypeChange={onDataProviderChange}
            />
        </div>
    )
}
