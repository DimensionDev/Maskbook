import { BalancerAPI } from './Balancer.js'
import { BancorAPI } from './Bancor.js'
import { DodoAPI } from './Dodo.js'
import { OpenOceanAPI } from './OpenOcean.js'
import { ZeroX_API } from './ZeroX.js'

export const Balancer = new BalancerAPI()
export const Bancor = new BancorAPI()
export const Dodo = new DodoAPI()
export const OpenOcean = new OpenOceanAPI()
export const ZeroX = new ZeroX_API()

export * from './UniSwapV2.js'
export * from './UniSwapV3.js'
