import { EMPTY_LIST } from '@masknet/shared-base'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { useSearchedKeyword } from '../../trending/useSearchedKeyword'
import { TagType } from '../../types'
import { TraderView } from './TraderView'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const keyword = useSearchedKeyword()
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
