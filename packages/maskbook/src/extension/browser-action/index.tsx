import '../../social-network-adaptor/browser-action'
import { status } from '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { BrowserActionRoot } from './UI'

status.then(() => SSRRenderer(<BrowserActionRoot />))
