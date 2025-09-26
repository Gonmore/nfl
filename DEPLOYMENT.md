# Despliegue con Docker

## Requisitos
- Docker y Docker Compose instalados en tu servidor Ubuntu.

## Pasos para desplegar

1. **Clona el repositorio en tu servidor:**
   ```bash
   git clone https://github.com/Gonmore/nfl.git
   cd nfl
   ```

2. **Configura las variables de entorno:**
   Copia el archivo `.env.example` a `.env` y ajusta las variables según tu configuración:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Asegúrate de cambiar las credenciales de la base de datos y otros valores sensibles.

3. **Construye y ejecuta los contenedores:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verifica que los servicios estén corriendo:**
   ```bash
   docker-compose ps
   ```

   Si hay problemas de conexión con la base de datos, limpia los volúmenes y reconstruye:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

5. **Accede a la aplicación:**
   - Frontend: http://tu-servidor-ip
   - Backend: http://tu-servidor-ip:5001 (si necesitas acceder directamente)

## Configuración para acceso público

Para que todo el mundo pueda acceder al frontend:

1. **Abre el puerto 80 en tu firewall:**
   ```bash
   sudo ufw allow 80
   ```

2. **Si tienes un dominio, configura Nginx como reverse proxy (opcional):**
   Crea un archivo de configuración en `/etc/nginx/sites-available/cartelnfl`:
   ```
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   Luego habilita el sitio y recarga Nginx.

## Comandos útiles

- **Ver logs:** `docker-compose logs -f`
- **Detener servicios:** `docker-compose down`
- **Actualizar:** `docker-compose pull && docker-compose up -d --build`

## Notas importantes

- El frontend ahora usa `/api` para las llamadas al backend, que nginx redirige a `backend:3000`.
- Asegúrate de que el archivo `.env` tenga las variables correctas para tu base de datos.
- Para producción, cambia las credenciales por defecto de PostgreSQL.
- Se crea automáticamente un usuario admin con email `admin@cartelnfl.com` y password `admin123` al iniciar por primera vez.