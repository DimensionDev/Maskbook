import { createNormalReactRoot } from '../../shared-ui/utils/createNormalReactRoot.js'
import Swap from '../Swap.js'
import { setupUIContext } from '../../shared-ui/initUIContext.js'

setupUIContext()
createNormalReactRoot(<Swap />)
