# Poolift: Group vs Direct Gift Comparison

## Quick Comparison Table

| Aspect | Grupo Permanente | Regalo Directo |
|--------|------------------|----------------|
| **Para** | Colectivos con regalos recurrentes | Ocasiones puntuales |
| **Ejemplos** | Clase, amigos, familia, trabajo | Despedida, boda, colecta |
| **Duración** | Todo el año (o más) | Una sola vez |
| **Pasos para empezar** | 4 pasos | 1 paso |
| **Miembros** | Múltiples, con invitación | Solo organizador |
| **Destinatarios** | Varios (cumpleaños del grupo) | Uno específico |
| **Propuestas** | Sí, con votación | Opcional, sin votación |
| **Reutilizable** | Sí | No |
| **Beneficio principal** | Coordinación completa | Rapidez |

---

## Detailed Comparison

### Setup Process

**Grupo Permanente (4 pasos):**
```
1. Seleccionar tipo de grupo (clase/amigos/familia/trabajo/otro)
2. Nombrar el grupo y añadir tu nombre
3. Compartir código de invitación
4. Añadir primera persona (opcional)
```

**Regalo Directo (1 paso):**
```
1. Completar formulario único:
   - Para quién
   - Tipo de ocasión
   - Regalo propuesto (opcional)
   - Tu nombre
   → ¡Listo! Comparte el enlace.
```

---

### Features Available

| Feature | Grupo | Directo |
|---------|-------|---------|
| Invitar miembros | ✅ | ❌ |
| Código de invitación | ✅ | ❌ |
| Añadir múltiples personas | ✅ | ❌ |
| Calendario de cumpleaños | ✅ | ❌ |
| Sugerir ideas de regalo | ✅ | ❌ |
| Crear propuestas formales | ✅ | ⚠️ Solo una |
| Votar propuestas | ✅ | ❌ |
| Compartir enlace público | ✅ | ✅ |
| Ver participantes | ✅ | ✅ |
| Cerrar colecta | ✅ | ✅ |
| Marcar como comprado | ✅ | ✅ |
| Historial de regalos | ✅ | ❌ |
| Coordinador rotativo | ✅ | ❌ |

---

### Ideal Use Cases

**Grupo Permanente - Ideal para:**

```
✓ Clase del colegio
  → 25 niños, 25 cumpleaños al año
  → Las familias proponen y votan
  → Un coordinador por fiesta

✓ Grupo de amigos
  → 8-10 personas
  → Cumpleaños recurrentes
  → Todos proponen ideas

✓ Familia extensa
  → Primos, tíos, sobrinos
  → Navidades y cumpleaños
  → Coordinación entre hogares

✓ Equipo de trabajo
  → Compañeros de departamento
  → Cumpleaños y ocasiones especiales
  → Contribuciones voluntarias
```

**Regalo Directo - Ideal para:**

```
✓ Despedida de trabajo
  → Compañero se va
  → Colecta rápida
  → Una sola ocasión

✓ Regalo de boda
  → Invitados contribuyen
  → Sin grupo permanente
  → Ocasión única

✓ Colecta para nacimiento
  → Regalo para nuevos padres
  → Contribución puntual
  → No requiere grupo

✓ Regalo de graduación
  → Familiares/amigos contribuyen
  → Evento único
  → Coordinación simple

✓ Ocasión especial one-off
  → Aniversario, jubilación
  → No hay relación de grupo
  → Solo recoger dinero
```

---

## Decision Guide

### Preguntas para decidir

**1. ¿Habrá más de un regalo este año?**
```
Sí → Grupo Permanente
No → Regalo Directo
```

**2. ¿Las mismas personas participarán varias veces?**
```
Sí → Grupo Permanente
No → Regalo Directo
```

**3. ¿Necesitas votar entre varias opciones de regalo?**
```
Sí → Grupo Permanente
No → Ambos pueden funcionar
```

**4. ¿Quieres un registro de quién participó en cada regalo?**
```
Sí → Grupo Permanente
No → Regalo Directo está bien
```

**5. ¿Es urgente y necesitas empezar ya?**
```
Sí → Regalo Directo (1 paso)
No → Cualquiera según otros criterios
```

---

## Flow Diagrams

### Grupo Permanente Flow

```
┌─────────────────┐
│ Crear Grupo     │
│ (Tipo + Nombre) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Invitar         │
│ Miembros        │──────┐
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Añadir          │      │ (miembros se unen
│ Personas        │      │  con código)
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Dashboard       │◄─────┘
│ del Grupo       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Crear           │────▶│ Votar           │
│ Propuesta       │     │ Propuestas      │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Coordinar       │
                        │ Compra          │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Regalo          │
                        │ Completado      │
                        └─────────────────┘
                                 │
                                 ▼
                        (Repetir para siguiente cumpleaños)
```

### Regalo Directo Flow

```
┌─────────────────┐
│ Crear Regalo    │
│ (1 formulario)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compartir       │
│ Enlace          │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Persona│ │Persona│  (participantes confirman)
│   1   │ │   2   │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Cerrar          │
│ Colecta         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Comprar         │
│ Regalo          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ¡Completado!    │
└─────────────────┘
```

---

## Common Questions

### "¿Puedo convertir un regalo directo en grupo?"

No directamente, pero puedes crear un grupo nuevo y añadir a las personas que participaron. El historial del regalo directo permanece separado.

### "¿Puedo crear un regalo directo siendo parte de un grupo?"

Sí. Son conceptos independientes. Puedes tener grupos permanentes Y crear regalos directos cuando lo necesites.

### "¿Qué pasa si creé un grupo pero solo lo necesito una vez?"

No hay problema. El grupo quedará ahí por si lo necesitas en el futuro. No hay obligación de usarlo recurrentemente.

### "¿Los regalos directos tienen menos funciones?"

Tienen las funciones necesarias para una ocasión única: compartir enlace, ver participantes, cerrar colecta, marcar como comprado. Lo que NO tienen es votación de propuestas (porque no hay múltiples opciones) ni historial (porque es único).

### "¿Cuál recomiendan?"

Depende de tu situación:
- Si vas a hacer esto más de una vez con las mismas personas → **Grupo**
- Si es una ocasión única o urgente → **Regalo Directo**

---

## Summary

| Si... | Elige... |
|-------|----------|
| Organizas regalos recurrentes | Grupo Permanente |
| Es una ocasión única | Regalo Directo |
| Quieres votar propuestas | Grupo Permanente |
| Necesitas empezar rápido | Regalo Directo |
| Las mismas personas participarán varias veces | Grupo Permanente |
| Solo necesitas recoger dinero | Regalo Directo |
| Quieres calendario de cumpleaños | Grupo Permanente |
| Es una despedida/boda/graduación | Regalo Directo |

---

## Visual Decision Tree

```
                    ¿Qué quieres hacer?
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
    ¿Recurrente?                       ¿Una sola vez?
         │                                   │
         ▼                                   ▼
┌─────────────────┐               ┌─────────────────┐
│                 │               │                 │
│  GRUPO          │               │  REGALO         │
│  PERMANENTE     │               │  DIRECTO        │
│                 │               │                 │
│  • Clase        │               │  • Despedida    │
│  • Amigos       │               │  • Boda         │
│  • Familia      │               │  • Nacimiento   │
│  • Trabajo      │               │  • Graduación   │
│                 │               │                 │
│  [Crear Grupo]  │               │  [Crear Regalo] │
│                 │               │                 │
└─────────────────┘               └─────────────────┘
```
