import { useAsync } from 'react-use'

const WEB3_DAO_TAB_TWITTER_ID_LIST_API = 'https://configuration.r2d2.to/twitter-supported-id-list.json'

// cspell:disable
export const DEFAULT_SUPPORTED_TWITTER_IDS = [
    'ConstitutionDAO',
    'juiceboxETH',
    'AssangeDAO',
    'OfficialMoonDAO',
    'TheSpiceDAO',
    'sharkdao',
    'CrayonFinance',
    'merge_dao',
    'DAOTaiFung',
    'Tile_DAO',
    'mountaindao',
    'OfficialMoonDAO',
]
// cspell:enable

export function useDaoTabTwitterIdList() {
    return useAsync(async () => {
        try {
            const response = await fetch(WEB3_DAO_TAB_TWITTER_ID_LIST_API)
            return response.json() as Promise<string[]>
        } catch (error) {
            return DEFAULT_SUPPORTED_TWITTER_IDS
        }
    }, [])
}
