import './initialization/fetch.js'
import './initialization/async-setup.js'
export const { activateSiteAdaptorUI } = await import(/* webpackMode: 'eager' */ './initialization/post-async-setup.js')
