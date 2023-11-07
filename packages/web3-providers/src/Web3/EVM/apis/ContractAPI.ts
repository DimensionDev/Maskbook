import { RequestAPI } from './RequestAPI.js'
import { ContractReadonlyAPI } from './ContractReadonlyAPI.js'

export class ContractAPI extends ContractReadonlyAPI {
    static override Default = new ContractAPI()
    protected override Request = new RequestAPI(this.options)
}
export const Contract = ContractAPI.Default
