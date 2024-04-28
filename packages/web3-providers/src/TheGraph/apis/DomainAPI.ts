import { first } from 'lodash-es'
import type { ChainId } from '@masknet/web3-shared-evm'
import { API_URL } from '../constants.js'
import type { DomainAPI } from '../../entry-types.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'

class TheGraphDomainAPI implements DomainAPI.Provider<ChainId> {
    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        const response = await fetchJSON<{
            data: {
                domains: Array<{
                    name: string
                    labelName: string
                    resolvedAddress: {
                        id: string
                    }
                }>
            }
        }>(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    domains(where: { name: "${name}" }) {
                        name
                        labelName
                        resolvedAddress {
                          id
                        }
                    }
                  }`,
            }),
        })

        return first(response.data.domains)?.resolvedAddress.id
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        const response = await fetchJSON<{
            data: {
                domains: Array<{
                    name: string
                    labelName: string
                }>
            }
        }>(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    domains(where: { owner: "${address}", resolvedAddress: "${address}" }, orderBy: createdAt) {
                      name
                      labelName
                    }
                  }`,
            }),
        })

        return first(response.data.domains)?.name
    }
}
export const TheGraphDomain = new TheGraphDomainAPI()
