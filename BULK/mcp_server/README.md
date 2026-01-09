# Servidor MCP de Plantillas de Email

Este servidor MCP (Model Context Protocol) proporciona herramientas para generar plantillas de email dinámicas para el sistema de gestión de cortinas.

## 📋 Características

- **Generación de emails de presupuesto**: Crea emails personalizados con datos del cliente, ID de pedido, unidades y dirección
- **Generación de emails de inicio de producción**: Crea emails de confirmación cuando un pedido pasa a estado "EN PRODUCCIÓN"
- **Plantillas HTML externas**: Las plantillas se cargan desde archivos `.html` para facilitar su edición
- **Listado de plantillas disponibles**: Función auxiliar para consultar qué plantillas están disponibles

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   cd mcp_server
   pip install -r requirements.txt
   ```

2. **Estructura de archivos:**
   ```
   mcp_server/
   ├── server.py              # Servidor MCP principal
   ├── requirements.txt       # Dependencias Python
   ├── templates/
   │   ├── email_presupuesto.html     # Plantilla de presupuesto
   │   └── email_produccion.html      # Plantilla de inicio de producción
   └── README.md             # Este archivo
   ```

## 🔧 Configuración

### Configuración en Claude Desktop

Para integrar este servidor con Claude Desktop, añade la siguiente configuración a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "email-templates": {
      "command": "python",
      "args": [
        "C:/Users/Usuari/Documents/CORTINAS-OK/Propuesta-Campa-a-Cortinas/mcp_server/server.py"
      ]
    }
  }
}
```

**Nota:** Asegúrate de usar la ruta absoluta correcta hacia tu archivo `server.py`.

## 📖 Uso

Una vez configurado, puedes usar comandos naturales con tu IA:

### Ejemplos de uso:

**Generar email de presupuesto:**
```
"Genera un email de presupuesto para el cliente 'Empresa XYZ' con el pedido 'INT-2025-001', son 25 unidades, dirección 'Calle Principal 123'"
```

**Generar email de inicio de producción:**
```
"Crea un email de confirmación de inicio de producción para 'Juan Pérez' con el pedido 'INT-2025-002'"
```

**Listar plantillas disponibles:**
```
"Qué plantillas de email están disponibles?"
```

## 🛠️ Funciones Disponibles

### `generar_email_presupuesto`
- **Parámetros:**
  - `nombre_cliente` (str): Nombre del cliente
  - `id_pedido` (str): ID del pedido (ej: INT-2025-xxxx)
  - `total_unidades` (int): Número de unidades
  - `direccion` (str, opcional): Dirección de entrega (por defecto: "A confirmar")
- **Retorna:** String HTML del email de presupuesto

### `generar_email_inicio_produccion`
- **Parámetros:**
  - `nombre_cliente` (str): Nombre del cliente
  - `id_pedido` (str): ID del pedido
- **Retorna:** String HTML del email de inicio de producción

### `listar_plantillas_disponibles`
- **Parámetros:** Ninguno
- **Retorna:** Lista de nombres de plantillas disponibles

## 🎨 Personalización de Plantillas

Las plantillas HTML están en la carpeta `templates/`. Puedes editarlas directamente para:

- Cambiar colores y estilos
- Modificar el texto base
- Añadir nuevos campos dinámicos
- Cambiar la estructura del email

**Variables disponibles en las plantillas:**
- `{{nombre_cliente}}`: Nombre del cliente
- `{{id_pedido}}`: ID del pedido
- `{{total_unidades}}`: Número de unidades (solo en presupuesto)
- `{{direccion}}`: Dirección de entrega (solo en presupuesto)

## 📝 Notas

- Las plantillas usan estilos CSS inline para máxima compatibilidad con clientes de email
- Los caracteres especiales se escapan automáticamente
- Las plantillas están diseñadas para ser responsive
- El servidor se ejecuta en modo desarrollo por defecto

## 🐛 Solución de Problemas

**Si el servidor no se inicia:**
1. Verifica que Python esté instalado: `python --version`
2. Comprueba que las dependencias estén instaladas: `pip install -r requirements.txt`
3. Asegúrate de que la carpeta `templates/` existe y contiene los archivos HTML

**Si Claude no reconoce el servidor:**
1. Verifica la ruta absoluta en la configuración
2. Reinicia Claude Desktop después de cambiar la configuración
3. Comprueba que el archivo `server.py` tenga permisos de ejecución

## 🤝 Contribuir

Para añadir nuevas plantillas:

1. Crea un nuevo archivo `.html` en la carpeta `templates/`
2. Añade la función correspondiente en `server.py`
3. Decora la función con `@mcp.tool()`
4. Actualiza este README con la nueva funcionalidad