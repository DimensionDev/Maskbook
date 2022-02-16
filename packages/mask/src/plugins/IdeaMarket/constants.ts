import { escapeRegExp } from 'lodash-unified'

export const SUBGRAPH_URL = 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket/'
export const TESTNET_SUBGRAPH_URL =
    'https://subgraph-test-avm-l2.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTESTAVML2/'

export const BASE_URL = 'https://ideamarket.io/'

export const ideaMarketHostnames = ['ideamarket.io']
export const ideaMarketPathnameRegexMatcher = /^\/i\/(\S+)\/(\S+)/

export function createMatchLink() {
    return new RegExp(`${escapeRegExp(BASE_URL)}/i/(\\S+)/(\\S+)`)
}
