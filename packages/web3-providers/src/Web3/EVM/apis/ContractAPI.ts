import { RequestAPI } from './RequestAPI.js'
import { ContractReadonlyAPI } from './ContractReadonlyAPI.js'

export class ContractAPI extends ContractReadonlyAPI {
    protected override Request = new RequestAPI(this.options)
}
