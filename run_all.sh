#!/bin/bash

# Cambiar a la carpeta raíz del proyecto
PROJECT_DIR=$(dirname "$0")
cd "$PROJECT_DIR" || exit

# Configuración de MySQL
MYSQL_USER="mi_usuario"
MYSQL_PASS="nuevaPassword123"

# Comando para iniciar el backend (Spring Boot)
BACKEND_DIR="$PROJECT_DIR/backend"
BACKEND_CMD="mvn spring-boot:run"

# Comando para iniciar el frontend (React)
FRONTEND_DIR="$PROJECT_DIR/frontend"
FRONTEND_CMD="npm start"

# Comando para iniciar MySQL
MYSQL_CMD="mysql -u $MYSQL_USER -p$MYSQL_PASS"

# Iniciar terminal para backend
gnome-terminal -- bash -c "cd $BACKEND_DIR && echo 'Iniciando backend...' && $BACKEND_CMD; exec bash"

# Iniciar terminal para frontend
gnome-terminal -- bash -c "cd $FRONTEND_DIR && echo 'Iniciando frontend...' && $FRONTEND_CMD; exec bash"

# Iniciar terminal para MySQL
gnome-terminal -- bash -c "echo 'Conectando a MySQL...' && $MYSQL_CMD; exec bash"
