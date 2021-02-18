import { makeStyles } from '@material-ui/core'
import { useSearchedKeywordAtTwitter } from '../../Trader/trending/useSearchedKeywordAtTwitter'
import { TagType } from '../../Trader/types'
import { PoolDeckView } from './PoolDeckView'

const useStyles = makeStyles({
    root: {},
})

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const classes = useStyles()
    const keyword = useSearchedKeywordAtTwitter()

    const [_, name = ''] = keyword.match(/[\#]([\w\d]+)lbp$/i) ?? []
    if (!name) return null

    return (
        <div className={classes.root}>
            <PoolDeckView
                name={name}
                // hash tag only
                tagType={TagType.HASH}
            />
        </div>
    )
}
