# External plugins

## Plugin management (TBD)

Priority (highest to lowest):

- Precise (`example.com/plugin`)
- Publisher (Must be code signed) (`publisher=HASH_OF_PUBLIC_KEY`)
- Domain based (`*.example.com/*`)
- Fallback/default settings

### Settings can be tweaked (TBD)

- Permission (only applicable for `Precise`, must grant case-by-case)
- Auto load unknown plugins (Not applicable for `Publisher`)
- Auto update plugins periodically
- Auto update everytime I use it (might cause too many web requests)
