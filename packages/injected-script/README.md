# Injected scripts

This package is intended to be run inside the SNS Network to provide some extra functionality.

This package has 3 project:

- `main`(internal): The core code, runs in a normal web page.
- `shared`(internal): Shared definition and constant values.
- `sdk`: Can be used to communicate with `main` part.

## Warning

Please be super cautious when you're editing this file.

Please make sure you know how JavaScript property access, getter/setter, Proxy, property descriptor works.

Please make sure you understand how Firefox content script security boundary works.

Please be aware that globalThis is NOT the same as globalThis.window (or window for short) in Firefox.
