import { BancorAPI } from './Bancor.js'
import { OpenOceanAPI } from './OpenOcean.js'
import { ZeroX_API } from './ZeroX.js'

export const Bancor = new BancorAPI()
export const OpenOcean = new OpenOceanAPI()
export const ZeroX = new ZeroX_API()

export * from './UniSwapV2.js'
export * from './UniSwapV3.js'
