# Nutrevia

Aplicación móvil desarrollada con React Native y Expo. El backend utiliza FastAPI y PostgreSQL mediante Docker.

## Requisitos

- Git, Docker Desktop, Node.js y npm.
- Expo Go compatible con el proyecto.
- Teléfono y computador en la misma red Wi-Fi.

## Cómo levantar el proyecto

### 1. Descargar el proyecto

```powershell
git clone URL_DEL_REPOSITORIO
cd Nutrevia
```

Si ya está descargado:

```powershell
git pull origin main
```

### 2. Crear los archivos de configuración

```powershell
Copy-Item .env.example .env
Copy-Item mobile\.env.example mobile\.env
```

El archivo `.env` configura el backend y `mobile/.env` configura la aplicación móvil. Ambos son locales y no deben subirse a GitHub.

### 3. Generar la clave privada JWT

Cada desarrollador debe generar su propia clave. Desde la carpeta `Nutrevia`, ejecutar:

```powershell
docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_hex(32))"
```

El comando mostrará una cadena aleatoria larga. Copiarla y abrir el archivo `.env`. La configuración debe quedar así:

```env
JWT_SECRET_KEY=PEGAR_AQUI_LA_CLAVE_GENERADA
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Reemplazar solamente `PEGAR_AQUI_LA_CLAVE_GENERADA`; no agregar espacios ni comillas. Por ejemplo:

```env
JWT_SECRET_KEY=9c14a8020e74461b8e588de38f423097f282cb91b09c56fe33fb37f2a5a673fa
```

La clave real se guarda únicamente en `.env`. No se coloca en `.env.example`, `compose.yaml` ni en el código fuente. Cada integrante puede utilizar una clave diferente en su entorno local.

### 4. Configurar la dirección del backend

Para utilizar un teléfono físico, ejecutar `ipconfig`, buscar la dirección IPv4 del Wi-Fi y escribirla en `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://TU_IP:8000
```

Ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.58:8000`.

Para un emulador Android, utilizar `http://10.0.2.2:8000`.

### 5. Levantar PostgreSQL y el backend

Abrir Docker Desktop y ejecutar desde la carpeta `Nutrevia`:

```powershell
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose ps
```

La base de datos debe aparecer como `healthy`. La API se puede revisar en:

- http://localhost:8000/health
- http://localhost:8000/docs

### 6. Levantar la aplicación móvil

```powershell
cd mobile
npm ci
npx tsc --noEmit
npx expo start --clear
```

Escanear el código QR con Expo Go.

## Prueba rápida

1. Registrar una cuenta e iniciar sesión.
2. Completar el perfil y seleccionar el objetivo.
3. Revisar los datos en Inicio, Diario y Perfil.
4. Tomar una fotografía y comprobar que el backend la recibe.
5. Cerrar y abrir la aplicación para verificar que la sesión se conserva.

## Problemas frecuentes

- **`Network request failed`:** revisar la IP, la conexión Wi-Fi y el firewall.
- **Expo no muestra los cambios:** ejecutar nuevamente `npx expo start --clear`.
- **Faltan tablas:** ejecutar `docker compose exec backend alembic upgrade head`.
- **Cambió `requirements.txt`:** ejecutar `docker compose up -d --build`.

## Importante

No subir a GitHub los archivos `.env`, contraseñas, claves JWT ni tokens.
