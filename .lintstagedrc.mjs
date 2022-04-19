export default {
    '*': 'prettier --write --ignore-unknown',
    'packages/**/*.{ts,tsx,js,jsx}': 'eslint -c packages/.eslintrc.json --fix',
    'packages/mask/**/*': () => 'gulp locale-kit --sync-keys --remove-unused-keys',
    'packages/web3-constants/**/*': 'pnpm start --filter web3-constants',
    'cspell.json': () => 'gulp reorder-spellcheck',
}
