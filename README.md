# TaskFlow

TaskFlow is a task planner with a **React Native CLI Android app** and a separate **NestJS + MongoDB API**. The mobile app uses TypeScript, Redux Toolkit, React Navigation, Axios, and JWT sessions. The API hashes passwords with bcrypt, validates request DTOs, and scopes every task query to the authenticated user.

## Project layout

- mobile/ — bare React Native Android app (no Expo), screens, Redux state, navigation, and API client.
- backend/ — NestJS modules for authentication and tasks, Mongoose schemas, DTO validation, and JWT guard.

## Quick start from the workspace root

Run these commands in separate terminals from `D:\TO DO APP`:

    npm start
    npm run start:api

For a connected Android phone, forward both development ports before opening the app:

    adb reverse tcp:8081 tcp:8081
    adb reverse tcp:3000 tcp:3000

You can also run `npm run android` from the workspace root to install or launch the mobile app.

## Run the API

Use MongoDB locally or provide a MongoDB connection string. From PowerShell:

    cd backend
    npm --offline=false install
    Copy-Item .env.example .env

Edit backend/.env and set a long random JWT_SECRET. Start the API:

    npm run start:dev

The API listens on port 3000 by default. Its endpoints are:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/register | Create an account and return a JWT |
| POST | /api/auth/login | Sign in and return a JWT |
| GET | /api/tasks | List the signed-in user's tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Edit a task or completion status |
| DELETE | /api/tasks/:id | Delete a task |

Task listing accepts status (all, open, completed, overdue), priority, category, tag, and sort (smart, deadline, created) query parameters. Smart ordering combines priority and deadline urgency, then uses scheduled time to break ties.

## Run the Android app

The mobile app currently targets a USB-connected Android device at http://127.0.0.1:3000/api. Keep the API running and, in another terminal, forward the API and Metro ports to the device:

    adb reverse tcp:3000 tcp:3000
    adb reverse tcp:8081 tcp:8081

Then start Metro and the app:

    cd mobile
    npm --offline=false install
    npm start

In another terminal:

    cd mobile
    npm run android

For an Android emulator, change API_BASE_URL in mobile/src/api/client.ts to http://10.0.2.2:3000/api. A physical device on the same Wi-Fi can instead use the development computer's LAN address. The Android debug build permits local HTTP; release traffic is configured to require HTTPS.

## Build a submission APK

The repository includes a Render Blueprint (`render.yaml`) for the API. To deploy it, create a MongoDB Atlas free cluster, then open Render and select **New > Blueprint** for this repository. Enter the Atlas connection string as `MONGODB_URI` when Render requests it. Render generates `JWT_SECRET` itself; do not put either value in Git, chat, or the mobile app. The backend health check is available at `/api/health`.

After Render finishes deploying, copy its HTTPS service URL and set `API_BASE_URL` in `mobile/src/api/client.ts` to that URL ending in `/api`. The current `127.0.0.1` address is only for local USB development and will not reach your computer from a reviewer's phone. Then build and verify the release APK below.

The free Render API sleeps after 15 minutes without traffic, so the first request after idle can take about a minute. Atlas free clusters are intended for small development/demo workloads and don't include backups. See the provider documentation for current limits.

Use JDK 17, then build the release variant from PowerShell:

    cd mobile/android
    $env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
    .\gradlew.bat assembleRelease

The APK is written to `mobile/android/app/build/outputs/apk/release/app-release.apk`. A local `mobile/android/key.properties` file and signing key are used when present; both are excluded from Git. Keep them private and backed up. A fresh clone must create its own signing key before making future APK updates.

## Verify

    cd backend
    npm test
    npm run typecheck
    npm run build

    cd mobile
    npm test
    npm run typecheck
    npm run android

The backend unit tests cover bcrypt registration/login, user-scoped task access, and priority/deadline ordering. The mobile unit tests cover the same ordering behavior. Building or running the API also requires a MongoDB instance reachable through MONGODB_URI.

## Security notes

- Passwords are stored as bcrypt hashes and never returned by the API.
- Task reads, updates, and deletes always include the authenticated user's MongoDB id in their database filter.
- JWT secrets belong in backend/.env; do not commit that file.
- Configure HTTPS and a production secret before deploying the API.
