# Maqueteo Pro

**Maqueteo Pro** es una aplicación desarrollada en Base44 para apoyar procesos de maquetación y gestión del trabajo asociado al proyecto.

Este repositorio está destinado al **desarrollo, ajuste y publicación técnica** de la aplicación.  
Si solo necesitas usar la herramienta como persona usuaria final, debes acceder a la **versión publicada** en tu navegador.

## Acceso para personas usuarias

Si tu objetivo es **usar la aplicación**, no necesitas instalar nada en tu computador.

1. Ingresa a la URL pública de la app: https://amber-bind-your-book.base44.app
2. Inicia sesión, si corresponde.
3. Utiliza la aplicación desde el navegador.

## ¿Para quién es este repositorio?

Este repositorio es útil para quienes necesitan:

- Desarrollar nuevas funciones o hacer ajustes en la app.
- Probar cambios localmente antes de publicarlos.
- Sincronizar cambios con Base44 y GitHub.
- Mantener la configuración técnica del proyecto.

Si eres usuaria o usuario final, utiliza la **URL publicada** de la aplicación y no este repositorio.

## Requisitos previos

Antes de trabajar localmente con el proyecto:

1. Clona el repositorio usando la URL Git del proyecto.
2. Ingresa al directorio del proyecto.
3. Instala las dependencias:

```
npm install
```

4. Instala Base44 CLI:

```
npm install -g base44@latest
```

Puedes revisar la documentación oficial del CLI aquí:  
https://docs.base44.com/developers/references/cli/get-started/overview

## Ejecutar el proyecto localmente

### Opción 1: entorno local completo

Para iniciar el entorno local completo desde la raíz del proyecto:

```
base44 dev
```

El comando `base44 dev` inicia el backend local de Base44 y, cuando la app está configurada para ello, también puede iniciar automáticamente el frontend.

### Opción 2: ejecutar solo el frontend

Si solo necesitas trabajar en la interfaz usando el backend alojado, ejecuta:

```
npm run dev
```

Luego abre la URL local mostrada por Vite en tu navegador.

## Uso del backend alojado

Para desarrollo solo de frontend, crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```
VITE_BASE44_APP_ID=tu_app_id
VITE_BASE44_APP_BASE_URL=https://amber-bind-your-book.base44.app
```

- `VITE_BASE44_APP_ID`: identifica la aplicación Base44.
- `VITE_BASE44_APP_BASE_URL`: indica a dónde deben enviarse las solicitudes locales a `/api`.

> Cuando utilizas `base44 dev`, estos valores suelen inyectarse automáticamente.  
> Por eso, `.env.local` se necesita principalmente en flujos de trabajo solo frontend.

## Publicación de cambios

Después de subir tus cambios a GitHub, abre el dashboard de Base44 y publica la aplicación:

```
base44 dashboard open
```

Recuerda que **hacer push al repositorio no siempre equivale a publicar la versión final para las personas usuarias**.  
Después del push, debes verificar la publicación en Base44.

## Flujo recomendado de trabajo

1. Actualiza o desarrolla cambios en el proyecto.
2. Prueba localmente la aplicación.
3. Haz commit y push al repositorio.
4. Abre Base44 Dashboard.
5. Publica la app.
6. Verifica la versión publicada en la URL pública.

## Documentación y soporte

- [Integración con GitHub](https://docs.base44.com/Integrations/Using-GitHub)
- [Referencia de comandos Base44 CLI](https://docs.base44.com/developers/references/cli/commands/introduction)
- [Soporte Base44](https://app.base44.com/support)

## Notas importantes

- Este repositorio está orientado a trabajo técnico.
- La URL pública es la vía correcta para uso cotidiano por parte de personas usuarias finales.
- Si la aplicación ya fue modificada en GitHub, verifica siempre que esos cambios estén también **publicados** en Base44.
