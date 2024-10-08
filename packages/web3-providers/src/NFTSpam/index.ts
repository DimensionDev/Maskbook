import type { PageIndicator } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'

type ReportStatus = 'reporting' | 'approved' | 'rejected'
type ReportSource = 'firefly' | 'mask-network'

export interface ReportParams {
    collection_id: string
    status: ReportStatus
    source: ReportSource
}

export interface ReportRecord {
    collection_id: string
    status: ReportStatus
    /** @example "2023-08-10T19:25:54Z" */
    create_at: string
    /** @example "2023-08-10T19:25:54Z" */
    update_at: string
}

/**
 * If not provided, the default status and source are both set to "all"
 */
interface GetReportsParams extends Partial<ReportParams> {
    page?: number
    page_size?: number
}

export type SpamResponse<T> =
    | {
          code: 200
          data: T
          cursor: number
          limit: number
      }
    | {
          code: 400
          message: string
          data: null
      }

const ENDPOINT = 'https://nftapi.firefly.land/v1/nfts/report/spam'
const PAGE_SIZE = 10
export class NFTSpam {
    static async report(params: ReportParams) {
        const res = await fetchJSON<SpamResponse<ReportRecord>>(ENDPOINT, {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(params),
        })
        return res
    }
    static async getReports(params: GetReportsParams, indicator?: PageIndicator) {
        const url = urlcat(ENDPOINT, {
            params,
            page: params.page ?? indicator?.index,
            page_size: params.page_size ?? PAGE_SIZE,
        })
        return fetchJSON<SpamResponse<ReportRecord[]>>(url)
    }
}
