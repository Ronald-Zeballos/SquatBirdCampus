# Squat Bird Campus Web

Prototipo web de Squat Bird Campus con control por manos usando webcam y MediaPipe.

## Controles
- Mueve las manos dentro de las franjas laterales.
- Manos arriba: el pajaro sube.
- Manos abajo: el pajaro baja.
- `Espacio`: respaldo de teclado.

## Ejecutar
1. Abre `Abrir-Web.cmd`, o
2. ejecuta `node server.js` y entra a `http://127.0.0.1:4173/`.

## Ejecutar con Docker
1. Instala Docker Desktop.
2. En la carpeta del proyecto corre `docker compose up --build`.
3. Abre `http://localhost:4173/`.

Importante:
- Para que la webcam funcione, abre el juego desde `http://localhost:4173/` en la misma PC donde esta la camara.
- No abras el `index.html` directo.
- No uses una IP local insegura si quieres permiso de camara; usa `localhost` o `https`.

## Funciones actuales
- Menu con seleccion de personaje.
- Adaptacion inicial de 10 segundos.
- Dificultad progresiva.
- Ranking persistente con nombre del jugador.
- Animacion de derrota y guardado local de scores.
