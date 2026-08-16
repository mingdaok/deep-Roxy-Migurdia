declare module '@deepseek-ai/cordis' {
  export interface Context {
    effect(callback: () => void | (() => void), label?: string): void
  }
}
