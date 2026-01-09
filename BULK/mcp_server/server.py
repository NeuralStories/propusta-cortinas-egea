from mcp.server.fastmcp import FastMCP
import os
from pathlib import Path

# Inicializamos el servidor MCP con el nombre del servicio
mcp = FastMCP("GestorDePlantillasEmail")

# Ruta a las plantillas
templates_dir = Path(__file__).parent / "templates"

def cargar_plantilla(nombre_archivo: str) -> str:
    """Carga una plantilla HTML desde el archivo"""
    ruta_plantilla = templates_dir / nombre_archivo
    try:
        with open(ruta_plantilla, 'r', encoding='utf-8') as archivo:
            return archivo.read()
    except FileNotFoundError:
        return f"Error: Plantilla {nombre_archivo} no encontrada"

@mcp.tool()
def generar_email_presupuesto(nombre_cliente: str, id_pedido: str, total_unidades: int, direccion: str = "A confirmar") -> str:
    """
    Genera el código HTML para el 'Email Presupuesto' basado en la plantilla estándar.
    
    Args:
        nombre_cliente: El nombre del cliente al que se saluda.
        id_pedido: El código de identificación del pedido (ej: INT-2025-xxxx).
        total_unidades: Cantidad numérica de unidades.
        direccion: Dirección de entrega (por defecto 'A confirmar').
    """
    # Cargar la plantilla base
    plantilla = cargar_plantilla("email_presupuesto.html")
    
    # Reemplazar las variables
    html_generado = plantilla.replace("{{nombre_cliente}}", nombre_cliente)
    html_generado = html_generado.replace("{{id_pedido}}", id_pedido)
    html_generado = html_generado.replace("{{total_unidades}}", str(total_unidades))
    html_generado = html_generado.replace("{{direccion}}", direccion)
    
    return html_generado

@mcp.tool()
def generar_email_inicio_produccion(nombre_cliente: str, id_pedido: str) -> str:
    """
    Genera el código HTML para el 'Email Inicio Produccion' confirmando el estado.
    
    Args:
        nombre_cliente: El nombre del cliente.
        id_pedido: El código de identificación del pedido.
    """
    # Cargar la plantilla base
    plantilla = cargar_plantilla("email_produccion.html")
    
    # Reemplazar las variables
    html_generado = plantilla.replace("{{nombre_cliente}}", nombre_cliente)
    html_generado = html_generado.replace("{{id_pedido}}", id_pedido)
    
    return html_generado

@mcp.tool()
def listar_plantillas_disponibles() -> list:
    """
    Lista todas las plantillas de email disponibles.
    
    Returns:
        Lista con los nombres de las plantillas disponibles.
    """
    try:
        plantillas = [archivo.name for archivo in templates_dir.glob("*.html")]
        return plantillas
    except Exception as e:
        return [f"Error al listar plantillas: {str(e)}"]

if __name__ == "__main__":
    # Ejecuta el servidor MCP
    mcp.run()