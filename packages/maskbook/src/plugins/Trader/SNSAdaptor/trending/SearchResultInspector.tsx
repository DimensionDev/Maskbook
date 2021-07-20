import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'
import { useSearchedKeyword } from '../../trending/useSearchedKeyword'
import { TagType } from '../../types'
import { TraderView } from './TraderView'

const useStyles = makeStyles({
    root: {},
})

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const classes = useStylesExtends(useStyles(), props)
    const keyword = useSearchedKeyword()
    const [_, type, name = ''] = keyword.match(/([\$\#])([\w\d]+)/) ?? []
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const { value: dataProviders = [] } = useAvailableDataProviders(type_, name)
    const { value: traderProviders = [] } = useAvailableTraderProviders(type_, name)

    if (!name || !dataProviders?.length) return null
    return (
        <div className={classes.root}>
            <TraderView
                isPopper={false}
                name={name}
                tagType={type_}
                dataProviders={dataProviders}
                tradeProviders={traderProviders}
            />
        </div>
    )
}
