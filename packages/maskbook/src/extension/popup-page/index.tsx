import '../../setup.ui'
import { activateSocialNetworkUI } from '../../social-network'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { Popup } from './UI'

activateSocialNetworkUI().then(() => SSRRenderer(<Popup />))
