import { getPublicAppBaseUrl } from 'src/utils/publicAppUrl'

const SITE_NAME = 'Home With Christ'
const DEFAULT_IMAGE_PATH = '/logo.png'

function normalizeLocale(locale) {
  return locale === 'en-US' ? 'en-US' : 'es-ES'
}

function getHomeSeo(locale) {
  if (locale === 'en-US') {
    return {
      title: 'Christian AI advisor, Bible and faith journal | Home With Christ',
      description: 'Home With Christ brings together a Christian AI advisor, a Bible reader, and a personal faith journal in one app.',
      robots: 'index,follow',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Android, iOS, Web',
        description: 'Christian app with AI spiritual guidance, Bible reading, and a personal journal.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }
    }
  }

  return {
    title: 'Consejero cristiano con IA, Biblia y diario espiritual | Home With Christ',
    description: 'Home With Christ reune un consejero espiritual con IA, una Biblia en linea y un diario personal para acompanar tu vida de fe.',
    robots: 'index,follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Android, iOS, Web',
      description: 'Aplicacion cristiana con guia espiritual por IA, lectura biblica y diario personal.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  }
}

function getBibleSeo(locale) {
  if (locale === 'en-US') {
    return {
      title: 'Online Bible search and reading | Home With Christ',
      description: 'Read the Bible online, browse books and chapters, and search verses inside Home With Christ.',
      robots: 'index,follow'
    }
  }

  return {
    title: 'Biblia en linea para leer y buscar versiculos | Home With Christ',
    description: 'Lee la Biblia en linea, explora libros y capitulos, y busca versiculos dentro de Home With Christ.',
    robots: 'index,follow'
  }
}

function getContactSeo(locale) {
  if (locale === 'en-US') {
    return {
      title: 'Contact and support | Home With Christ',
      description: 'Contact Home With Christ for support, privacy questions, and general inquiries.',
      robots: 'index,follow'
    }
  }

  return {
    title: 'Contacto y soporte | Home With Christ',
    description: 'Contacta a Home With Christ para soporte, solicitudes de privacidad y consultas generales.',
    robots: 'index,follow'
  }
}

function getPrivacySeo(locale) {
  if (locale === 'en-US') {
    return {
      title: 'Privacy policy | Home With Christ',
      description: 'Review how Home With Christ handles account data, shared content, AI providers, and privacy requests.',
      robots: 'index,follow'
    }
  }

  return {
    title: 'Politica de privacidad | Home With Christ',
    description: 'Consulta como Home With Christ maneja los datos de cuenta, el contenido compartido, los proveedores de IA y las solicitudes de privacidad.',
    robots: 'index,follow'
  }
}

function getTermsSeo(locale) {
  if (locale === 'en-US') {
    return {
      title: 'Terms of service | Home With Christ',
      description: 'Read the terms for using Home With Christ, including account, content, AI, and availability conditions.',
      robots: 'index,follow'
    }
  }

  return {
    title: 'Terminos del servicio | Home With Christ',
    description: 'Lee los terminos de uso de Home With Christ, incluidas las condiciones sobre cuenta, contenido, IA y disponibilidad.',
    robots: 'index,follow'
  }
}

function getNoIndexSeo(title) {
  return {
    title,
    robots: 'noindex,nofollow'
  }
}

function getRouteSeo(path, locale) {
  const resolvedLocale = normalizeLocale(locale)

  if (path === '/welcome') return getHomeSeo(resolvedLocale)
  if (path === '/bible') return getBibleSeo(resolvedLocale)
  if (path === '/contact') return getContactSeo(resolvedLocale)
  if (path === '/privacy-policy') return getPrivacySeo(resolvedLocale)
  if (path === '/terms') return getTermsSeo(resolvedLocale)

  if (path === '/login') {
    return getNoIndexSeo(resolvedLocale === 'en-US' ? 'Sign in | Home With Christ' : 'Iniciar sesion | Home With Christ')
  }
  if (path === '/forgot-password') {
    return getNoIndexSeo(resolvedLocale === 'en-US' ? 'Recover account access | Home With Christ' : 'Recuperar acceso | Home With Christ')
  }
  if (path === '/reset-password') {
    return getNoIndexSeo(resolvedLocale === 'en-US' ? 'Reset password | Home With Christ' : 'Restablecer contrasena | Home With Christ')
  }
  if (path.startsWith('/shared-chat/')) {
    return getNoIndexSeo(resolvedLocale === 'en-US' ? 'Shared chat | Home With Christ' : 'Chat compartido | Home With Christ')
  }
  if (path.startsWith('/shared-diary/')) {
    return getNoIndexSeo(resolvedLocale === 'en-US' ? 'Shared diary entry | Home With Christ' : 'Diario compartido | Home With Christ')
  }

  return getNoIndexSeo(SITE_NAME)
}

function absoluteUrl(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).href
}

function getDefaultStructuredData(baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: absoluteUrl(baseUrl, DEFAULT_IMAGE_PATH)
  }
}

function setMetaTag(key, attribute, value) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`) ||
    document.head.querySelector(`meta[data-seo-key="${key}"]`)

  if (!value) {
    tag?.remove()
    return
  }

  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }

  tag.dataset.seoKey = key
  tag.setAttribute(attribute, key)
  tag.setAttribute('content', value)
}

function setLinkTag(key, rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`) ||
    document.head.querySelector(`link[data-seo-key="${key}"]`)

  if (!href) {
    tag?.remove()
    return
  }

  if (!tag) {
    tag = document.createElement('link')
    document.head.appendChild(tag)
  }

  tag.dataset.seoKey = key
  tag.setAttribute('rel', rel)
  tag.setAttribute('href', href)
}

function setStructuredData(blocks) {
  document.head.querySelectorAll('script[data-seo-key="structured-data"]').forEach((node) => node.remove())

  blocks.forEach((block) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seoKey = 'structured-data'
    script.textContent = JSON.stringify(block)
    document.head.appendChild(script)
  })
}

export function applyRouteSeo(to, locale) {
  if (typeof document === 'undefined') return

  const baseUrl = getPublicAppBaseUrl()
  const imageUrl = absoluteUrl(baseUrl, DEFAULT_IMAGE_PATH)
  const canonicalUrl = absoluteUrl(baseUrl, to.fullPath || to.path || '/')
  const seo = getRouteSeo(to.path, locale)

  document.title = seo.title || SITE_NAME
  document.documentElement.lang = normalizeLocale(locale).split('-')[0]

  setMetaTag('description', 'name', seo.description || '')
  setMetaTag('robots', 'name', seo.robots || 'index,follow')
  setMetaTag('og:title', 'property', seo.title || SITE_NAME)
  setMetaTag('og:description', 'property', seo.description || '')
  setMetaTag('og:type', 'property', 'website')
  setMetaTag('og:url', 'property', canonicalUrl)
  setMetaTag('og:image', 'property', imageUrl)
  setMetaTag('og:site_name', 'property', SITE_NAME)
  setMetaTag('twitter:card', 'name', 'summary_large_image')
  setMetaTag('twitter:title', 'name', seo.title || SITE_NAME)
  setMetaTag('twitter:description', 'name', seo.description || '')
  setMetaTag('twitter:image', 'name', imageUrl)

  setLinkTag('canonical', 'canonical', canonicalUrl)

  const structuredData = [getDefaultStructuredData(baseUrl)]
  if (seo.structuredData) {
    structuredData.push({
      ...seo.structuredData,
      url: canonicalUrl,
      image: imageUrl
    })
  }
  setStructuredData(structuredData)
}
