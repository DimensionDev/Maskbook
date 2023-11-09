import { EVMRequestAPI } from './RequestAPI.js'
import { EVMContractReadonlyAPI } from './ContractReadonlyAPI.js'

export class EVMContractAPI extends EVMContractReadonlyAPI {
    static override Default = new EVMContractAPI()
    protected override Request = new EVMRequestAPI(this.options)
}
export const EVMContract = EVMContractAPI.Default
