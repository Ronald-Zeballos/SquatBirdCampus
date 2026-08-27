2. Creá el proyecto

En Unity Hub:

Projects → New Project

Elegí:

Universal 2D

Si no aparece:

2D Core

Nombre:

SquatBirdCampus

Ubicación: donde quieras.

Después:

Create Project

Esperá hasta que Unity termine de importar todo.

3. Configuración inicial

En Unity:

Edit → Project Settings → Player

Por ahora no hace falta cambiar gran cosa.

Después:

Window → Package Manager

Verificá que tengas:

Universal RP, si elegiste Universal 2D
Input System
TextMeshPro

No instales:

❌ AR Foundation
❌ ARCore
❌ OpenCV
❌ TensorFlow
❌ Barracuda
❌ Python

No los necesitamos.

La cámara la vamos a obtener directamente con:

WebCamTexture

que ya viene con Unity.

4. Instalar MediaPipe

Acá está la parte importante.

Usaremos:

MediaPipeUnityPlugin v0.16.3 — homuler

Actualmente v0.16.3 aparece como la release más reciente. El plugin soporta Unity 2022.3 o superior y utiliza MediaPipe 0.10.22.

Podés entrar acá:

MediaPipeUnityPlugin Releases

Buscá:

v0.16.3

Para empezar en Windows podés usar el .unitypackage precompilado.

Algo parecido a:

MediaPipeUnityPlugin.0.16.3.unitypackage

El proyecto recomienda usar los paquetes precompilados; simplemente clonar el repositorio no incluye todas las librerías/modelos necesarios.

5. Importarlo

Dentro de Unity:

Assets → Import Package → Custom Package

Seleccionás el .unitypackage.

Luego:

Import All

Va a tardar.

Unity puede quedarse compilando bastante rato.

MUY IMPORTANTE

Mirá abajo:

Console

No debería quedar ningún error rojo.

Warnings amarillos pueden existir.

Errores rojos:

paramos ahí.

No conectes todavía Codex si MediaPipe está roto.

6. Una consideración importante para Windows

Para nuestra primera versión vamos a usar CPU para MediaPipe.

El plugin indica que el modo GPU de MediaPipe no está soportado en Windows/macOS dentro de este plugin.

Eso está perfecto para:

webcam
una persona
detección de pose
sentadillas

No necesitamos GPU todavía.

7. Qué tiene que haber antes de activar el MCP

Tu proyecto debería verse aproximadamente así:

SquatBirdCampus
│
├── Assets
├── Packages
├── ProjectSettings
└── ...

Y dentro de Unity deberías poder:

▶ Play

sin que aparezcan errores rojos.

No hace falta que armes escenas.

No hace falta que hagas scripts.

No hace falta crear carpetas.

ESO se lo vamos a dejar a Codex.
8. Ahora sí: activás tu MCP de Unity

Abrís:

Unity

Codex

tu MCP Unity

Y verificás que Codex pueda:

ver la escena
ver Assets
crear GameObjects
crear scripts
leer Console
guardar escenas
crear prefabs

Una vez que esté conectado:

pegale el siguiente prompt entero.

Este va a ser nuestro PROMPT MAESTRO.

PROMPT MAESTRO — SQUAT BIRD CAMPUS

Quiero que actúes como desarrollador principal de este proyecto de Unity.

Tienes acceso al proyecto mediante Unity MCP.

Tu responsabilidad será inspeccionar, crear, modificar, ejecutar, probar y depurar el proyecto directamente utilizando las herramientas disponibles mediante el MCP.

No asumas que una operación funcionó simplemente porque escribiste código.

Después de cada etapa:

Guarda los assets.
Espera que Unity compile.
Revisa la Console.
Corrige errores.
No continúes mientras existan errores rojos de compilación.
OBJETIVO GENERAL

Crear un videojuego interactivo llamado provisionalmente:

Squat Bird Campus

Será un juego inspirado en la mecánica de Flappy Bird, pero controlado mediante movimientos corporales detectados con una webcam.

El jugador estará frente a una cámara.

La cámara del jugador aparecerá en tiempo real como fondo del gameplay.

MediaPipe Pose detectará su cuerpo.

Cuando el jugador haga una sentadilla:

el personaje volador realizará un Flap.

Por lo tanto:

SENTADILLA FÍSICA
→
DETECCIÓN DE POSE
→
SQUAT DETECTED
→
FLAP
→
PERSONAJE SUBE

El objetivo será atravesar obstáculos y conseguir la mayor puntuación posible.

PLATAFORMA INICIAL

Desarrollar primero exclusivamente para:

Windows PC + webcam.

No implementar Android todavía.

El proyecto deberá prepararse para que posteriormente pueda adaptarse a Android.

TECNOLOGÍAS

Utilizar:

Unity 6
C#
Unity UI
WebCamTexture
MediaPipeUnityPlugin instalado actualmente en el proyecto
MediaPipe Pose Landmarker
Rigidbody2D

NO instalar por ahora:

AR Foundation
ARCore
ARKit
OpenCV adicional
TensorFlow
Barracuda
Python
librerías innecesarias
REGLA CRÍTICA SOBRE MEDIAPIPE

Antes de escribir cualquier integración con MediaPipe:

INSPECCIONA EL PLUGIN REALMENTE INSTALADO.

Busca:

namespaces disponibles
clases reales
PoseLandmarker
Tasks API
ejemplos incluidos
escenas de ejemplo
scripts de ejemplo

No inventes nombres de clases.

No inventes métodos.

No utilices APIs de tutoriales correspondientes a versiones antiguas si no existen en la versión instalada.

Adapta la implementación a la API REAL del proyecto.

En Windows utilizar inicialmente ejecución CPU.

ESTILO DEL JUEGO

La identidad visual debe estar inspirada en un campus universitario tropical.

Estética:

PIXEL ART 16-BIT MODERNO

Elementos visuales:

edificios de ladrillo rojizo
techos rojos
grandes ventanales
jardines
árboles
palmeras
caminos
césped
vegetación tropical

La referencia visual del campus será proporcionada mediante imágenes posteriormente.

NO crear arte definitivo utilizando primitivas.

Mientras no existan los assets finales utilizar placeholders claramente identificados.

PERSONAJES SELECCIONABLES

Habrá inicialmente cuatro personajes.

1. NIBU

Mascota tipo búho.

Será uno de los personajes principales.

2. TUCÁN

Inspirado en los tucanes presentes en el campus.

3. PAVO REAL AZUL

Pavo real azul.

4. PAVO REAL VERDE

Segunda variante de pavo real.

Los cuatro serán proporcionados posteriormente como sprites pixel-art.

SISTEMA DE PERSONAJES

NO crear cuatro sistemas de movimiento diferentes.

Crear:

CharacterData.cs

como ScriptableObject.

Debe almacenar:

ID
nombre
sprite preview
sprite idle
sprites flap
escala
posición visual
collider configurable
fuerza de flap
animator si corresponde

Todos utilizan:

BirdController.cs

El personaje seleccionado únicamente cambia la apariencia y sus parámetros.

ESTRUCTURA DE CARPETAS

Crear:

Assets/_Game

Assets/_Game/Scenes

Assets/_Game/Scripts

Assets/_Game/Scripts/Core

Assets/_Game/Scripts/Camera

Assets/_Game/Scripts/Pose

Assets/_Game/Scripts/Gestures

Assets/_Game/Scripts/Gameplay

Assets/_Game/Scripts/Characters

Assets/_Game/Scripts/UI

Assets/_Game/Scripts/Debug

Assets/_Game/Prefabs

Assets/_Game/Prefabs/Characters

Assets/_Game/Prefabs/Obstacles

Assets/_Game/Art

Assets/_Game/Art/Backgrounds

Assets/_Game/Art/Characters

Assets/_Game/Art/Environment

Assets/_Game/Art/UI

Assets/_Game/Audio

Assets/_Game/Data

Assets/_Game/Materials

Nunca reorganices las carpetas internas del plugin MediaPipe.

ESCENAS

Crear:

Bootstrap.unity

MainMenu.unity

Gameplay.unity

BOOTSTRAP

Debe encargarse de inicialización y cargar MainMenu.

Mantenerlo extremadamente simple.

MAIN MENU

Crear menú principal.

Elementos:

SQUAT BIRD CAMPUS

JUGAR

PERSONAJE

CONFIGURACIÓN

SALIR

Agregar selector de personajes.

Mostrar:

personaje actual

nombre

preview

flecha izquierda

flecha derecha

El personaje seleccionado deberá guardarse localmente.

Mientras no existan sprites finales utilizar placeholders.

GAMEPLAY

Estructura aproximada:

Gameplay

GameManager

CameraSystem

PoseSystem

GestureSystem

ObstacleSystem

Player

Canvas

EventSystem

CÁMARA

Crear:

WebcamManager.cs

Debe:

encontrar cámaras disponibles
seleccionar una webcam válida
crear WebCamTexture
iniciar cámara
detenerla correctamente
liberar recursos
mostrar video en RawImage
ocupar la pantalla
conservar aspect ratio
corregir rotación
soportar mirror horizontal

Por defecto:

la cámara debe comportarse como un espejo.

El usuario debe verse de manera natural.

Si no hay webcam:

mostrar:

"No se encontró una cámara"

No provocar crash.

DISEÑO DEL GAMEPLAY

IMPORTANTE:

Durante Gameplay el fondo principal será:

LA WEBCAM EN VIVO.

El jugador debe poder verse mientras juega.

Por encima de la webcam se renderizarán:

personaje
obstáculos
UI
score
decoraciones pixel art

No colocar un fondo sólido que tape la webcam.

MEDIAPIPE POSE

Crear:

PoseManager.cs

Su trabajo será únicamente obtener información corporal.

No debe controlar directamente al personaje.

Necesitamos al menos:

LEFT_HIP

RIGHT_HIP

LEFT_KNEE

RIGHT_KNEE

LEFT_ANKLE

RIGHT_ANKLE

Guardar también confidence/visibility cuando la API instalada lo permita.

Si la pose se pierde:

PoseDetected = false.

SQUAT DETECTOR

Crear:

SquatDetector.cs

Calcular el ángulo:

HIP
→
KNEE
→
ANKLE

para cada pierna.

Calcular:

LeftKneeAngle

RightKneeAngle

AverageKneeAngle

Valores iniciales configurables:

StandingAngle = 155

SquatAngle = 105

Cooldown = 0.35

Crear estados:

Unknown

Standing

Squatting

FUNCIONAMIENTO DE SENTADILLA

Si:

estado = Standing

y

AverageKneeAngle < SquatAngle

Entonces:

cambiar estado a Squatting.

Disparar UNA VEZ:

OnSquatDetected

Mientras siga agachado:

NO volver a disparar eventos.

Para habilitar una nueva sentadilla:

AverageKneeAngle > StandingAngle

Entonces:

estado vuelve a Standing.

Esto debe evitar múltiples saltos provocados por la misma sentadilla.

FALLBACK DE UNA PIERNA

Si ambas piernas tienen buena visibilidad:

usar promedio.

Si solamente una pierna tiene tracking confiable:

usar esa pierna temporalmente.

Si ninguna es confiable:

PoseState = Unknown.

Nunca generar un Squat cuando la pose sea inválida.

SISTEMA DE EVENTOS

La arquitectura debe ser desacoplada.

NO hacer:

SquatDetector → BirdController directamente.

Crear una señal/evento conceptual:

FlapRequested

Puede ser emitido por:

SquatDetector

o

KeyboardDebugInput

BirdController escucha:

FlapRequested

y ejecuta:

Flap()

CONTROL DE DEBUG

Antes incluso de terminar MediaPipe:

SPACE

debe ejecutar:

FlapRequested.

Así podremos probar todo el juego sin depender del reconocimiento corporal.

La tecla SPACE y la sentadilla deben utilizar EXACTAMENTE la misma acción del gameplay.

No crear dos caminos independientes.

BIRD CONTROLLER

Crear:

BirdController.cs

Utilizar:

Rigidbody2D

Características:

gravedad
FlapForce
velocidad vertical
collider
rotación visual según velocidad
animación flap
bloqueo tras Game Over

Cuando recibe:

FlapRequested

ejecuta:

Flap()

OBSTÁCULOS

Crear:

ObstacleSpawner.cs

ObstacleMover.cs

ScoreTrigger.cs

Los obstáculos:

aparecen a la derecha

se desplazan hacia la izquierda

tienen apertura vertical

altura aleatoria

son destruidos al salir de pantalla

ESTILO DE LOS OBSTÁCULOS

NO utilizar tuberías verdes de Flappy Bird.

Los obstáculos estarán inspirados en el campus.

Ejemplos:

columnas de ladrillo

torres

paredes

ventanales

arcos

edificios

estructuras universitarias

Arriba puede aparecer una estructura.

Abajo otra.

El espacio central será por donde vuela el personaje.

Utilizar placeholders hasta recibir los sprites.

PUNTUACIÓN

Cuando el personaje atraviesa correctamente un obstáculo:

Score += 1

Mostrar puntuación actual.

Guardar:

High Score.

GAME OVER

Si el personaje:

choca contra obstáculo

o

sale de límites permitidos

Entonces:

Game Over.

Mostrar:

SCORE

HIGH SCORE

REINTENTAR

MENÚ

CALIBRACIÓN CORPORAL

Antes de comenzar la partida:

mostrar:

"Ponte frente a la cámara"

Después:

"Párate derecho"

Verificar:

cadera

rodillas

tobillos

Mostrar:

POSE OK

cuando exista tracking suficiente.

Luego:

3

2

1

GO

y comenzar.

Agregar opción Debug:

SkipCalibration.

UI DEBUG

Cuando DebugMode = true mostrar:

FPS

Webcam: TRUE/FALSE

Pose Detected: TRUE/FALSE

Left Knee

Right Knee

Average Knee

Squat State

Squat Count

Flap Count

En versión normal este panel no será visible.

GAME MANAGER

Crear:

GameManager.cs

Estados:

Boot

Calibration

Countdown

Playing

Paused

GameOver

GameManager será responsable de controlar transición entre estados.

RESOLUCIÓN

Diseño base:

1920 × 1080

Landscape.

Canvas:

Scale With Screen Size.

Reference Resolution:

1920 × 1080.

Debe verse correctamente también a:

1366 × 768.

RENDIMIENTO

Objetivo:

60 FPS cuando sea posible.

Evitar allocations innecesarias cada frame.

No activar segmentation masks.

No ejecutar modelos que no utilizamos.

Solo necesitamos Pose Landmarker.

ASSETS

Los assets definitivos serán proporcionados posteriormente.

Habrá como mínimo:

Background_Menu_Campus

Nibu

Toucan

Peacock_Blue

Peacock_Green

BrickObstacle_Top

BrickObstacle_Bottom

UI_Panel

UI_Button

No intentes sustituirlos por arte definitivo.

Crear placeholders con nombres claros.

FASES DE DESARROLLO

NO HAGAS TODO DE GOLPE.

Trabajaremos por fases.

FASE 1 — BASE DEL JUEGO

REALIZA AHORA ÚNICAMENTE ESTA FASE.

Inspeccionar proyecto.
Inspeccionar paquetes instalados.
Confirmar que MediaPipe existe.
Crear estructura de carpetas.
Crear escenas.
Crear Gameplay.
Crear WebcamManager.
Mostrar webcam correctamente como fondo.
Crear Player placeholder.
Crear BirdController.
Crear KeyboardDebugInput.
SPACE debe ejecutar Flap.
Aplicar gravedad.
Verificar Play Mode.
Revisar Console.
Corregir todos los errores.

DETENTE AQUÍ.

Al terminar dime:

qué archivos creaste
qué objetos creaste
qué probaste
si la webcam funciona
si SPACE hace Flap
si existen warnings
si existen errores

NO continúes automáticamente a FASE 2.

Espera mi autorización.

FASE 2

MediaPipe Pose Landmarker.

FASE 3

SquatDetector.

FASE 4

Obstáculos + Score + Game Over.

FASE 5

Menú + selección de personajes.

FASE 6

Integración de assets finales.

FASE 7

Polish:

animaciones

audio

partículas

feedback visual

difficulty scaling.

FASE 8

Android.

REGLAS FINALES

Usa Unity MCP para inspeccionar el proyecto real.

No inventes el estado del proyecto.

No inventes APIs.

No dejes errores rojos.

No dejes Missing Scripts.

No generes dependencias innecesarias.

No modifiques MediaPipe internamente salvo necesidad real.

Prioriza código simple, modular y funcional.

Primero Windows.

Primero CPU para MediaPipe.

Primero el MVP.

Empieza ahora únicamente con:

FASE 1.

9. Así vamos a trabajar

Cuando Codex termine la Fase 1, no le digas simplemente “seguí”.

Me mandás lo que te devolvió o una captura de Unity.