import { EMPTY_LIST } from '@masknet/shared-base'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { TagType } from '../../types'
import { TraderView } from './TraderView'

export interface SearchResultInspectorProps {
    keyword: string
}

export function SearchResultInspector({ keyword }: SearchResultInspectorProps) {
    const [_, type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const { value: dataProviders = EMPTY_LIST } = useAvailableDataProviders(type_, name)

    if (!name || !dataProviders?.length) return null
    return (
        <TargetChainIdContext.Provider>
            <TraderView isPopper={false} name={name} tagType={type_} dataProviders={dataProviders} />
        </TargetChainIdContext.Provider>
    )
}
