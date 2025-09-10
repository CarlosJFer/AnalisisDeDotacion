# Debug: Extension Error

## Pasos para diagnosticar:

1. **Abrir modo incógnito**: Ctrl+Shift+N (Chrome) o Ctrl+Shift+P (Firefox)
   - Si el error desaparece, es causado por una extensión

2. **Deshabilitar extensiones temporalmente**:
   - Chrome: chrome://extensions/ → Deshabilitar todas
   - Firefox: about:addons → Deshabilitar todas

3. **Extensiones comunes que causan este error**:
   - AdBlockers
   - Password managers
   - Developer tools extensions
   - React DevTools (a veces)
   - Redux DevTools

## Si el error persiste sin extensiones:
- Es un problema de la aplicación que necesita ser corregido