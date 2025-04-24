import type { PageIndicator } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'

export interface ReportParams {
    chainId: number
    contract_address: string
}

export interface ReportResult {
    status: 'SUCCESS' | string
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

const ENDPOINT = 'https://api.firefly.land/v1/nft/reportNFT'
const PAGE_SIZE = 10
export class NFTSpam {
    static async report(chainId: number, contract_address: string) {
        const url = urlcat(ENDPOINT, {
            chainId,
            contract_address,
        })
        return fetchJSON<SpamResponse<ReportResult>>(url)
    }
    static async getReports(params: GetReportsParams, indicator?: PageIndicator) {
        const url = urlcat(ENDPOINT, {
            params,
            page: params.page ?? indicator?.index,
            page_size: params.page_size ?? PAGE_SIZE,
        })
        return fetchJSON<SpamResponse<ReportResult[]>>(url)
    }
}
