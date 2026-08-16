import backgroundPlate from '../../assets/isekai-academy-dusk-bg-v1.webp'
import composerFrame from '../../assets/composer-frame-nine-slice-v1.webp'
import roxyCharacter from '../../assets/roxy-character-night.webp'
import sidebarPlate from '../../assets/sidebar-ornament-bg.webp'
import type { Context } from '@deepseek-ai/cordis'
import './roxy-skin.module.css'

const OWNER = 'roxy-migurdia'
const TITLE = '洛琪希·星穹水神书库 · DeepSeek Harness'
const THEME_COLOR = '#040d1d'
const SIDEBAR_SELECTOR = "[class*='_sidebarCol']"
const COMPOSER_SELECTOR = "[data-composer-card='true']"
const CONTENT_COLUMN_SELECTOR = "[data-slot='conversation.view'] [class*='_column']"
const COMPOSER_FRAME_PROPERTY = '--roxy-composer-frame-art'

function decorativeImage(kind: string, src: string, className: string): HTMLImageElement {
  const image = document.createElement('img')
  image.src = src
  image.alt = ''
  image.className = className
  image.dataset.roxyOwner = OWNER
  image.dataset.roxyDecoration = kind
  image.setAttribute('aria-hidden', 'true')
  image.draggable = false
  return image
}

function createScene(): HTMLElement {
  const scene = document.createElement('div')
  scene.className = 'roxy-scene'
  scene.dataset.roxyOwner = OWNER
  scene.setAttribute('aria-hidden', 'true')
  scene.append(
    decorativeImage('background', backgroundPlate, 'roxy-scene__background'),
    decorativeImage('character', roxyCharacter, 'roxy-scene__character'),
  )
  return scene
}

export function apply(ctx: Context): void {
  ctx.effect(() => {
    const previousTitle = document.title
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousThemeColor = themeMeta?.content
    let observer: MutationObserver | undefined
    let sidebarObserver: ResizeObserver | undefined
    let observedSidebar: HTMLElement | undefined
    let frameRequest = 0
    let decorate = () => {}
    let active = false
    let previousComposerFrame = ''

    const start = () => {
      if (active || !document.body) return
      active = true
      document.body.dataset.roxySkin = OWNER
      document.body.prepend(createScene())
      previousComposerFrame = document.documentElement.style.getPropertyValue(COMPOSER_FRAME_PROPERTY)
      document.documentElement.style.setProperty(COMPOSER_FRAME_PROPERTY, `url("${composerFrame}")`)
      document.title = TITLE
      if (themeMeta) themeMeta.content = THEME_COLOR

      decorate = () => {
        const sidebar = document.querySelector<HTMLElement>(SIDEBAR_SELECTOR)
        if (sidebar) {
          if (!sidebar.querySelector('[data-roxy-decoration="sidebar"]')) {
            sidebar.prepend(decorativeImage('sidebar', sidebarPlate, 'roxy-sidebar-plate'))
          }
          if (observedSidebar !== sidebar) {
            sidebarObserver?.disconnect()
            observedSidebar = sidebar
            sidebarObserver = new ResizeObserver(([entry]) => {
              document.documentElement.style.setProperty('--roxy-sidebar-width', `${entry.contentRect.width}px`)
            })
            sidebarObserver.observe(sidebar)
          }

          const settings = sidebar.querySelector<HTMLElement>("[data-slot='sidebar.settings']")
          if (settings) {
            let footer = settings.parentElement
            while (footer && footer !== sidebar) {
              if (
                footer.querySelector("[data-slot='sidebar.footer.action']") ||
                typeof footer.className === 'string' && footer.className.includes('footArea')
              ) {
                footer.dataset.roxySidebarFooter = ''
                break
              }
              footer = footer.parentElement
            }
          }
        }

        cancelAnimationFrame(frameRequest)
        frameRequest = requestAnimationFrame(() => {
          const contentColumn = document.querySelector<HTMLElement>(CONTENT_COLUMN_SELECTOR)
          const currentSidebar = document.querySelector<HTMLElement>(SIDEBAR_SELECTOR)
          if (!contentColumn || !currentSidebar) return
          const composer = document.querySelector<HTMLElement>(COMPOSER_SELECTOR)
          const composerInset = composer?.parentElement
            ? Number.parseFloat(getComputedStyle(composer.parentElement).paddingInlineStart) || 0
            : 0
          const offset = Math.max(
            28,
            Math.round(contentColumn.getBoundingClientRect().left - currentSidebar.getBoundingClientRect().right - composerInset),
          )
          document.documentElement.style.setProperty('--roxy-content-offset', `${offset}px`)
        })
      }

      decorate()
      observer = new MutationObserver(decorate)
      observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener('resize', decorate)
    }

    if (document.body) start()
    else document.addEventListener('DOMContentLoaded', start, { once: true })

    return () => {
      document.removeEventListener('DOMContentLoaded', start)
      observer?.disconnect()
      sidebarObserver?.disconnect()
      cancelAnimationFrame(frameRequest)
      window.removeEventListener('resize', decorate)
      document.querySelectorAll(`[data-roxy-owner="${OWNER}"]`).forEach((element) => element.remove())
      document.documentElement.style.removeProperty('--roxy-sidebar-width')
      document.documentElement.style.removeProperty('--roxy-content-offset')
      if (previousComposerFrame) {
        document.documentElement.style.setProperty(COMPOSER_FRAME_PROPERTY, previousComposerFrame)
      } else {
        document.documentElement.style.removeProperty(COMPOSER_FRAME_PROPERTY)
      }
      if (document.body) delete document.body.dataset.roxySkin
      if (active) document.title = previousTitle
      if (themeMeta && previousThemeColor !== undefined) themeMeta.content = previousThemeColor
    }
  }, 'roxy-ui-skin')
}
