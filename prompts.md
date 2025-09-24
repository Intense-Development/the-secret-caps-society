> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**  
“As the best fullstack developer, help me prepare a boilerplate for a new project using Next.js, Shadcn UI, TDD, and Supabase, ensuring best practices and clean architecture.”

**Prompt 2:**  
“Include a README with all library versions and step-by-step startup instructions.”

**Prompt 3:**  
“Ensure the frontend is mobile responsive and compatible with all browsers, and the backend follows clean architecture with TDD configuration.”

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**  
“Provide a high-level architecture diagram showing components and technologies used (Next.js, Supabase, Tailwind, Stripe/PayPal, PostgreSQL).”

**Prompt 2:**  
“Explain why this architecture was chosen, the benefits it brings, and any trade-offs.”

**Prompt 3:**  
“Include diagram in Markdown-friendly format.”

### **2.2. Descripción de componentes principales:**

**Prompt 1:**  
“Describe the main components of the system (frontend, backend, DB, payments) including the technology used.”

**Prompt 2:**  
“Provide details on how Supabase, Stripe, and PayPal are integrated.”

**Prompt 3:**  
“Explain testing frameworks, E2E, unit tests, and CI/CD integration.”

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**  
“Show the project folder structure with purpose of main directories.”

**Prompt 2:**  
“Explain how clean architecture principles are applied in the folder organization.”

**Prompt 3:**  
“Provide a brief description of entry points and main modules.”

### **2.4. Infraestructura y despliegue**

**Prompt 1:**  
“Explain the deployment setup using Vercel and Supabase.”

**Prompt 2:**  
“Provide a diagram of infrastructure components.”

**Prompt 3:**  
“Describe CI/CD pipelines and deployment process.”

### **2.5. Seguridad**

**Prompt 1:**  
“Enumerate the main security practices implemented (e.g., JWT, environment variables).”

**Prompt 2:**  
“Explain server-side keys usage and Supabase security rules.”

**Prompt 3:**  
“Include examples of secure endpoints and authentication.”

### **2.6. Tests**

**Prompt 1:**  
“Describe unit tests for functions and components using Jest.”

**Prompt 2:**  
“Describe integration tests for API endpoints with Supabase.”

**Prompt 3:**  
“Describe E2E tests using Playwright for full user flows.”

---

### 3. Modelo de Datos

**Prompt 1:**  
“Generate a Mermaid ER diagram including PKs, FKs, and all entity relationships (Users, Stores, Products, Orders, Order_Items, Payments).”

**Prompt 2:**  
“Explain the entity relationships and purpose of each table.”

**Prompt 3:**  
“Provide details on attributes, types, constraints, and relationships for documentation.”

---

### 4. Especificación de la API

**Prompt 1:**  
“Document 3 main REST endpoints in OpenAPI format: GET /products, POST /orders, POST /payments.”

**Prompt 2:**  
“Include request and response examples.”

**Prompt 3:**  
“Explain authentication, error handling, and best practices for REST design.”

---

### 5. Historias de Usuario

**Prompt 1:**  
“Document a user story for registration and login for buyers.”

**Prompt 2:**  
“Document a user story for product creation and management by sellers.”

**Prompt 3:**  
“Document a user story for order creation, checkout, and payment confirmation.”

---

### 6. Tickets de Trabajo

**Prompt 1:**  
“Create a backend ticket for implementing POST /orders endpoint with validation and tests.”

**Prompt 2:**  
“Create a frontend ticket for Cart component with quantity updates and checkout flow.”

**Prompt 3:**  
“Create a database ticket for creating PRODUCTS, ORDERS, ORDER_ITEMS tables with constraints and indices.”

---

### 7. Pull Requests

**Prompt 1:**  
“PR documenting implementation of backend orders endpoint with tests.”

**Prompt 2:**  
“PR documenting frontend Cart component with tests and checkout integration.”

**Prompt 3:**  
“PR documenting database migrations for products, orders, and order_items with referential integrity.”

---

> **Nota:** La conversación completa se encuentra en el archivo original [`prompts.md`](./prompts.md) y se puede consultar para referencia detallada.
