# Servicios HTTP — Convención del proyecto

Toda interacción con el backend **debe pasar por un servicio** ubicado en `src/services/`.  
Nunca uses `fetch` o `axios` directamente desde un componente o un store.

---

## Estructura de un servicio

```js
import ApiService from 'src/boot/api'

class MiServicio extends ApiService {
  constructor () {
    super('/prefijo-ruta-backend') // Ej: '/users', '/posts'
  }

  // Métodos disponibles heredados de ApiService:
  // this.get(path, options?)
  // this.post(path, body?, options?)
  // this.put(path, body?, options?)
  // this.delete(path, options?)
}

export default new MiServicio()
```

`ApiService` (en `src/boot/api.js`) se encarga automáticamente de:
- Inyectar el header `Authorization: Bearer <accessToken>`.
- Reintentar la petición una vez si recibe un `401`, refrescando el token primero.
- Enviar las cookies HttpOnly (`credentials: 'include'`).

---

## Servicios existentes

| Servicio | Archivo | Prefijo | Descripción |
|---|---|---|---|
| `AuthService` | `AuthService.js` | `/auth` | Login, refresh, logout |
| `ChatService` | `ChatService.js` | `/bot` | Chat con el consejero IA vía SSE streaming |

---

## Cuándo crear un nuevo servicio

Crea un nuevo archivo en `src/services/` **siempre que necesites hablar con una ruta nueva del backend**.

### Checklist antes de hacer una petición

1. ¿Ya existe un servicio para esa sección del backend?  
   → **Sí**: añade el método al servicio existente.  
   → **No**: crea un nuevo servicio siguiendo la plantilla de abajo.

2. ¿La petición devuelve un stream (SSE)?  
   → Implementa el método manualmente con `fetch` + `ReadableStream` (ver `ChatService.chatStream`).  
   → El resto de peticiones normales usan `this.get / this.post / this.put / this.delete`.

---

## Plantilla para un servicio nuevo

Copia esto en `src/services/NombreService.js`:

```js
import ApiService from 'src/boot/api'

class NombreService extends ApiService {
  constructor () {
    super('/ruta') // Cambia por el prefijo real, ej: '/users'
  }

  // Ejemplo GET con parámetros de query
  getAll (params) {
    const qs = new URLSearchParams(params).toString()
    return this.get(`/?${qs}`)
  }

  // Ejemplo GET por ID
  getById (id) {
    return this.get(`/${id}`)
  }

  // Ejemplo POST
  create (body) {
    return this.post('/', body)
  }

  // Ejemplo PUT
  update (id, body) {
    return this.put(`/${id}`, body)
  }

  // Ejemplo DELETE
  remove (id) {
    return this.delete(`/${id}`)
  }
}

export default new NombreService()
```

---

## Plantilla para un servicio con SSE (streaming)

Usa este patrón cuando el backend responde con `Content-Type: text/event-stream`:

```js
import ApiService from 'src/boot/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

class NombreStreamService extends ApiService {
  constructor () {
    super('/ruta')
  }

  async stream (body, onChunk) {
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()

    const headers = { 'Content-Type': 'application/json' }
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const response = await fetch(`${BASE_URL}/ruta/endpoint`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Error en la petición')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        try {
          const json = JSON.parse(line.slice(6))
          if (json.error) throw new Error(json.error)
          onChunk(json)
        } catch {}
      }
    }
  }
}

export default new NombreStreamService()
```

---

## Uso desde un componente o store

```js
// En un componente Vue
import miServicio from 'src/services/MiServicio'

const data = await miServicio.getAll({ page: 1 })
```

```js
// En un store Pinia
import miServicio from 'src/services/MiServicio'

actions: {
  async cargar () {
    this.items = await miServicio.getAll()
  }
}
```
