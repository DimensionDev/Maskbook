import '../tasks/NotCancellable/OnInstall.js'

import './async-setup.js'
import './storage-setup.js'
import './fetch.js'

import '../tasks/setup.js'
import { startServices } from '../services/setup.js'
startServices()
