import { createNextIndicator, createPageable, EMPTY_LIST, type PageIndicator } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { type FriendTech as FT } from '../types/FriendTech.js'
import { HOST } from './constants.js'

type Response<T> = T | { message: string }
type PaginationResponse<T> = (T & { nextPageStart?: number }) | { message: string }
type HoldersResponse = PaginationResponse<{
    users: FT.Holder[]
}>
type ActivitiesResponse = PaginationResponse<{
    users: FT.TradeRecord[]
}>

export class FriendTech {
    static async getUser(address?: string) {
        if (!address) return null
        const url = urlcat(HOST, '/users/:address', { address })
        const response = await fetchJSON<Response<FT.User>>(url)
        if ('message' in response) return null
        return response
    }

    static async getHolders(address: string, indicator?: PageIndicator) {
        if (!address) return createPageable(EMPTY_LIST, indicator, undefined)
        const url = urlcat(HOST, '/users/:address/token/holders', { address, pageStart: indicator?.id })

        const response = await fetchJSON<HoldersResponse>(url)
        if ('message' in response) return createPageable(EMPTY_LIST, indicator, undefined)
        return createPageable(
            response.users,
            indicator,
            response.nextPageStart ? createNextIndicator(indicator, response.nextPageStart.toString()) : undefined,
        )
    }
    static async getHolding(address: string, indicator?: PageIndicator) {
        if (!address) return createPageable(EMPTY_LIST, indicator, undefined)
        const url = urlcat(HOST, '/users/:address/token-holdings', { address, pageStart: indicator?.id })

        const response = await fetchJSON<HoldersResponse>(url)
        if ('message' in response) return createPageable(EMPTY_LIST, indicator, undefined)
        return createPageable(
            response.users,
            indicator,
            response.nextPageStart ? createNextIndicator(indicator, response.nextPageStart.toString()) : undefined,
        )
    }
    static async getActivities(address: string, indicator?: PageIndicator) {
        const url = urlcat(HOST, '/users/:address/trade-activity', { address, pageStart: indicator?.id })

        const response = await fetchJSON<ActivitiesResponse>(url)
        if ('message' in response) return createPageable(EMPTY_LIST, indicator, undefined)
        return createPageable(
            response.users,
            indicator,
            response.nextPageStart ? createNextIndicator(indicator, response.nextPageStart.toString()) : undefined,
        )
    }

    /** Get user info by twitter user id */
    static async getUserInfo(userId?: string) {
        if (!userId) return null
        const url = urlcat(HOST, '/twitter-users/:userId', { userId })
        const response = await fetchJSON<FT.User>(url)
        return response.address ? response : null
    }
}
