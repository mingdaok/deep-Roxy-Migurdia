declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.webp' {
  const source: string
  export default source
}
