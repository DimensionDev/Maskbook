/// <reference types="@masknet/global-types/web-extension" />

void Promise.all([import('../../shared-ui/initialization/index.js'), import('./render.js')])
    .then(([, { renderPopup }]) => renderPopup())
    .catch((error: unknown) => console.error('Failed to initialize the popup.', error))
