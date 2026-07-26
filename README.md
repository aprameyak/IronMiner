# IronMiner

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)
![LiveKit](https://img.shields.io/badge/LiveKit-DB0000?logo=livekit&logoColor=white&style=for-the-badge)
![Android](https://img.shields.io/badge/Android-34A853?logo=android&logoColor=white&style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)

## About

**IronMiner** is a spatial intelligence platform for construction site management built for UMD x IronSite 2026. Three AI agents — powered by the **Claude API** and GPU processing via Vast.ai — analyze job site video footage to detect congestion, safety violations, and productivity bottlenecks. The **React/TypeScript** frontend and **FastAPI** backend are complemented by an **Android** headset client for live worker streaming over **LiveKit**, with persistent data stored in **Supabase**.

## Features

- Video Agent ingests site footage, extracts frames, and runs spatial analysis via GPU (Vast.ai)
- Safety Agent detects PPE non-compliance, zone violations, and blocked corridors
- Productivity Agent scores congestion per zone, identifies trade overlap, and suggests resource reallocation
- Review Mode: upload footage, receive AI briefings, browse zone congestion maps and alert feeds
- Live Mode: monitor real-time camera feeds, communicate with workers, and receive instant alerts via WebSockets
- Android headset client streams live video from workers using LiveKit audio/video
- BIM-style zone overlay visualizes spatial layout directly in the dashboard
- Teams board tracks worker assignments and pool allocation across active sites

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Python, FastAPI, WebSockets
- **AI**: Claude API (vision + text), Vast.ai (GPU inference)
- **Database**: Supabase (PostgreSQL)
- **Live Comms**: LiveKit
- **Mobile**: Android (Kotlin)
- **Containerization**: Docker
