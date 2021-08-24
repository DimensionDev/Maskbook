import '../../social-network-adaptor/browser-action'
import { status } from '../../setup.ui'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot'
import { BrowserActionRoot } from './UI'

status.then(() => createNormalReactRoot(<BrowserActionRoot />))
