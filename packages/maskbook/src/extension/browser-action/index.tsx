import '../../social-network-adaptor/browser-action'
import { status } from '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { BrowserActionRoot } from './UI'
import { Dialogs } from '../popups/render'
status.then(() => SSRRenderer(<Dialogs />))
