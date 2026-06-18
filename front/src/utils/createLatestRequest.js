function isAbortError(err) {
  return err?.name === 'AbortError'
}

export default function createLatestRequest() {
  let currentRequestId = 0
  let currentController = null

  return {
    async run(executor) {
      currentRequestId += 1
      const requestId = currentRequestId

      currentController?.abort()
      const controller = new AbortController()
      currentController = controller

      try {
        const value = await executor(controller.signal)

        if (requestId !== currentRequestId) {
          return { status: 'stale' }
        }

        return { status: 'success', value }
      } catch (err) {
        if (requestId !== currentRequestId || isAbortError(err) || controller.signal.aborted) {
          return { status: 'aborted' }
        }

        throw err
      } finally {
        if (requestId === currentRequestId && currentController === controller) {
          currentController = null
        }
      }
    },

    cancel() {
      currentRequestId += 1
      currentController?.abort()
      currentController = null
    },

    isRunning() {
      return currentController !== null
    }
  }
}
