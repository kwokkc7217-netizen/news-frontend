// Google Analytics 4 — measurement ID 由 build-time env VITE_GA_MEASUREMENT_ID 讀入。
// 未設就乜都唔做，個站照行。
export function initAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!id) return

  const loader = document.createElement('script')
  loader.async = true
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
  document.head.appendChild(loader)

  const config = document.createElement('script')
  config.text =
    'window.dataLayer = window.dataLayer || [];\n' +
    'function gtag(){dataLayer.push(arguments);}\n' +
    "gtag('js', new Date());\n" +
    "gtag('config', '" +
    id +
    "');\n"
  document.head.appendChild(config)
}
