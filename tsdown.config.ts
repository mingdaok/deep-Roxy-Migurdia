import { readFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { transform } from 'lightningcss'
import type { UserConfig } from 'tsdown'

const PLUGIN_ID = '@dsh-external/dsh-client-ui-skin-roxy'
const CSS_PREFIX = '\0roxy-css:'
const CSS_SUFFIX = '.mjs'
const ASSET_PREFIX = '\0roxy-asset:'

const nodeConfig: UserConfig = {
  name: PLUGIN_ID,
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
}

const clientConfig: UserConfig = {
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: true,
  clean: false,
  plugins: [
    {
      name: 'roxy-image-assets-inline',
      resolveId(source: string, importer?: string) {
        if (!source.endsWith('.webp')) return null
        return ASSET_PREFIX + (importer ? resolve(dirname(importer), source) : resolve(source))
      },
      async load(id: string) {
        if (!id.startsWith(ASSET_PREFIX)) return null
        const filename = id.slice(ASSET_PREFIX.length)
        this.addWatchFile(filename)
        const data = await readFile(filename)
        return `export default ${JSON.stringify(`data:image/webp;base64,${data.toString('base64')}`)};`
      },
    },
    {
      name: 'roxy-css-modules-inline',
      resolveId(source: string, importer?: string) {
        if (!source.endsWith('.module.css')) return null
        return CSS_PREFIX + (importer ? resolve(dirname(importer), source) : resolve(source)) + CSS_SUFFIX
      },
      async load(id: string) {
        if (!id.startsWith(CSS_PREFIX)) return null
        const filename = id.slice(CSS_PREFIX.length, -CSS_SUFFIX.length)
        this.addWatchFile(filename)
        const source = await readFile(filename)
        const { code, exports: cssExports } = transform({
          filename,
          code: source,
          cssModules: { pattern: '[hash]_[local]' },
          minify: true,
        })
        const classMap: Record<string, string> = {}
        for (const [local, value] of Object.entries(cssExports ?? {})) classMap[local] = value.name
        const tagId = `${PLUGIN_ID}/${basename(filename)}`
        return [
          `const css = ${JSON.stringify(code.toString())};`,
          `const tagId = ${JSON.stringify(tagId)};`,
          "if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {",
          "  const tag = document.createElement('style');",
          `  tag.dataset.plugin = ${JSON.stringify(PLUGIN_ID)};`,
          '  tag.dataset.pluginCss = tagId;',
          '  tag.textContent = css;',
          '  document.head.appendChild(tag);',
          '}',
          `export default ${JSON.stringify(classMap)};`,
        ].join('\n')
      },
    },
  ],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default [nodeConfig, clientConfig]
