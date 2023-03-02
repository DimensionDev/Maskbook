export default {
    '*': 'prettier --write --ignore-unknown',
    'packages/**/*.{ts,tsx,js,jsx}': 'eslint --fix',
    'packages/web3-constants/**/*': () => 'pnpm --filter ./packages/web3-constants start',
    'cspell.json': () => 'gulp reorder-spellcheck',
    'packages/**/*.svg': 'npx svgo',
}
