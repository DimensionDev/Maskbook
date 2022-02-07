import { useAsync } from 'react-use'

const WEB3_DAO_TAB_TWITTER_ID_LIST_API = 'https://configuration.r2d2.to/twitter-supported-id-list.json'

export const DEFAULT_SUPPORTED_TWITTER_IDS = [
    'ConstitutionDAO',
    'juiceboxETH',
    /* cspell:disable-next-line */
    'AssangeDAO',
    'OfficialMoonDAO',
    'TheSpiceDAO',
    /* cspell:disable-next-line */
    'sharkdao',
    'CrayonFinance',
    'merge_dao',
    /* cspell:disable-next-line */
    'DAOTaiFung',
    'Tile_DAO',
    /* cspell:disable-next-line */
    'mountaindao',
    'OfficialMoonDAO',
]

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
