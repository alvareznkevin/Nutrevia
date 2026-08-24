# Nutrevia

## Requisitos

- Git
- Node.js
- Docker Desktop
- Android Studio o Expo Go

## Configuración

```powershell
git clone https://github.com/alvareznkevin/Nutrevia/
cd Nutrevia
Copy-Item .env.example .env
Copy-Item mobile\.env.example mobile\.env
docker compose up --build


Luego, en otra terminal:
cd Nutrevia\mobile
npm install
npx expo start
