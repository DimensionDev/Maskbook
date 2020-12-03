import { useAsync } from 'react-use'
import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { useI18N } from '../../utils/i18n-next-ui'
import { TradeProvider } from '../../plugins/Trader/types'
import { SearchResultView } from '../../plugins/Trader/UI/trending/SearchResultView'
import { useSearchedKeyword } from '../../plugins/Trader/trending/useSearchedKeyword'
import { PluginTraderRPC } from '../../plugins/Trader/messages'

const useStyles = makeStyles({
    root: {},
})

export interface SearchResultBoxProps extends withClasses<never> {}

export function SearchResultBox(props: SearchResultBoxProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const keyword = useSearchedKeyword()
    const [_, name = ''] = keyword.match(/[\$\#]([\w\d]+)/) ?? []
    const { value: dataProviders } = useAsync(async () => {
        if (!name) return
        return PluginTraderRPC.getAvailableDataProviders(name)
    }, [name])

    if (!name || !dataProviders?.length) return null
    return (
        <div className={classes.root}>
            <SearchResultView
                name={name}
                dataProviders={dataProviders}
                tradeProviders={[TradeProvider.UNISWAP, TradeProvider.ZRX]}
            />
        </div>
    )
}
