# schemas/

Esquemas de datos formales (JSON Schema) para todo lo que entra y sale del
sistema: documentos extraídos, respuestas de los servicios de IA, expedientes,
catálogos de la base de conocimiento.

Objetivo: que ninguna respuesta de IA se dé por buena sin validar contra un
esquema, y que el formato del expediente esté definido en un sitio único.

**Estado actual: vacía.** Hoy no existe validación de esquema en ninguna parte.
Las respuestas de la IA se interpretan con `parseJSON()` y se consumen tal cual;
si falta un campo, aparece vacío en el informe sin ningún aviso. La validación
con esquema figura como pendiente en `CONTEXT.md` desde la auditoría de la
sesión 6 y fue **diferida explícitamente por Pol** en la sesión 21.
