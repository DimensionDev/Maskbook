import { escapeRegExp } from 'lodash-unified'
import { useAsync } from 'react-use'
import { fetchAllTokens } from '../apis'

export function useFetchIdeaTokensBySearch(searchText: string) {
    const searchRegex = new RegExp(escapeRegExp(searchText), 'i')
    console.log('useFetchIdeaTokens')

    const { value, error, loading } = useAsync(async () => {
        console.log('useAsync')
        return fetchAllTokens(searchText)
    }, [searchText])
    console.log(value)

    // const filteredTokens = value?.ideaTokens.filter((row: any) => {
    //     return Object.keys(row).some((field) => {
    //         return searchRegex.test(row[field].toString())
    //     })
    // })

    return { tokens: value?.ideaTokens, error, loading }
}
