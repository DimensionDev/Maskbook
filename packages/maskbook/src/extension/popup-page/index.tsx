import '../../social-network-adaptor/popup-page'
import { status } from '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { Popup } from './UI'

status.then(() => SSRRenderer(<Popup />))
