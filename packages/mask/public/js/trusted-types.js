/// <reference path="../../../polyfills/types/dom.d.ts" />

// This file must not be loaded via importScripts in a Worker, doing so the importScripts will fail due to trustedTypes restriction.
// You can import this file (not importScripts) so webpack will bundle this into the initial chunk. This requires the worker have no multiple initial chunks.
if (typeof trustedTypes === 'object' && location.protocol.includes('extension')) {
    // DO NOT add createHTML or createScript.
    trustedTypes.createPolicy('default', { createScriptURL: (string) => string })
}

undefined
