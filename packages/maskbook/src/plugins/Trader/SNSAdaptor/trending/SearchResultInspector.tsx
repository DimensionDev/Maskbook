import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'
import { useSearchedKeyword } from '../../trending/useSearchedKeyword'
import { TagType } from '../../types'
import { TraderView } from './TraderView'

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const keyword = useSearchedKeyword()
    const [_, type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const { value: dataProviders = [] } = useAvailableDataProviders(type_, name)
    const { value: traderProviders = [] } = useAvailableTraderProviders(type_, name)

    if (!name || !dataProviders?.length) return null
    return (
        <TraderView
            isPopper={false}
            name={name}
            tagType={type_}
            dataProviders={dataProviders}
            tradeProviders={traderProviders}
        />
    )
}
