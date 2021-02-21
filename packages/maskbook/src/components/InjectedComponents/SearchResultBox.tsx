import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { useI18N } from '../../utils/i18n-next-ui'
import { TagType, TradeProvider } from '../../plugins/Trader/types'
import { SearchResultView } from '../../plugins/Trader/UI/trending/SearchResultView'
import { useSearchedKeyword } from '../../plugins/Trader/trending/useSearchedKeyword'
import { useAvailableDataProviders } from '../../plugins/Trader/trending/useAvailableDataProviders'

const useStyles = makeStyles({
    root: {},
})

export interface SearchResultBoxProps extends withClasses<never> {}

export function SearchResultBox(props: SearchResultBoxProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const keyword = useSearchedKeyword()
    const [_, type, name = ''] = keyword.match(/([\$\#])([\w\d]+)/) ?? []
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const { value: dataProviders } = useAvailableDataProviders(type_, name)

    if (!name || !dataProviders?.length) return null
    return (
        <div className={classes.root}>
            <SearchResultView
                name={name}
                tagType={type_}
                dataProviders={dataProviders}
                tradeProviders={[
                    TradeProvider.UNISWAP,
                    TradeProvider.SUSHISWAP,
                    TradeProvider.ZRX,
                    TradeProvider.SASHIMISWAP,
                    TradeProvider.BALANCER,
                ]}
            />
        </div>
    )
}
