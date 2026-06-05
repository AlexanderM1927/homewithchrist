# Instrucciones para agentes

- Ejecutar cualquier comando de `node` o `npm` dentro del contenedor Docker correspondiente.
- Para frontend, usar el servicio `frontend`, por ejemplo: `docker compose exec -T frontend npm run lint`.
- Para backend, usar el servicio `backend`, por ejemplo: `docker compose exec -T backend node --check server.js`.
- No ejecutar comandos `node` o `npm` directamente en el host para este proyecto.
