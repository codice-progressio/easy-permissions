# easy-permissions

Gestión rápida y fácil de permisos en express.

> Crea un fichero `segudirad/permisos.seguridad.js` y registra en el todos los permisos que se definan en la apliación con la función `$()`

## Instalacion

`npm i @codice-progressio/easy-permissions`

## Uso

```javascript
// Importa la libreria
const easyPermissions = require("@codice-progressio/easy-permissions")
// Setea los parametros básicos de configuración
easyPermissions.config({
  modoProduccion: false,
  generarPermisos: true,
})
```

### Llamamos la función `$` desde cada archivo de rutas que queramos asegurar.

```javascript
const $ = require("@codice-progressio/easy-permissions").$

app.get("/", $("nuevo-permiso", "cam"), (req, res, next) => {
  res.send("ok")
})
```

### Recuperar permiso faltante.

Es posible recuperar el permiso faltante en caso de que `express-jwt-permissions` detecte que no existe dentro del token desencriptado.

```javascript
//El middleware de captura de errores.
app.use((err, req, res, next)=>{
  let nombreParametroRequest = easyPermissions.configuraciones.nombreParametroRequest

  if(req[nombreParametroRequest]){
    let leyenda = "No tienes permiso: " + req[nombreParametroRequest]
    return res.status(401).send(leyenda)
  }
})

```

### Registrar solo texto

Por defecto `$` devuelve un callback que funciona como medio para ejecutar la comprobación de seguridad de la ruta con `express-jwt-permissions`, pero es posible solo registrar el permiso seteando las opcion `{esMiddleware:false}`.

```javascript
const MiMenu = [
  {
    titulo: "Menu que requiere permisos",
    permissions: [
      // Retorna solo "menus:menus-con-permisos"
      $(
        "menus:menus-con-permisos",
        "Este menú requiere este permisos para visualizarze",
        { esMiddleware: false }
      ),
    ],
  },
]
```

### Configuraciones disponibles y valores por defecto.

| Opción                 | Valor por defecto       | Descripción                                                                                                                                                                                   |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path                   | "./"                    | El path del fichero en el cual se van a estar agregando los permisos.                                                                                                                         |
| nombreArchivoPermisos  | "permisos.seguridad.js" | El nombre del archivo que se buscara.                                                                                                                                                         |
| nombreCarpetaPermisos  | "seguridad"             | El nombre de la carpeta                                                                                                                                                                       |
| modoProduccion         | true                    | Generalmente recibe process.env.NODE_ENV                                                                                                                                                      |
| nombreParametroRequest | "permisoSolicitado"     | Parametro que se adjunta al request y contiene el permiso definido el middleware. Su mejor función en cuando hay un error de permisos y se quiere saber cual fue el permiso solicitado.       |
| generarPermisos        | false                   | Por defecto detiene la generación del archivo. Mantenerlo por defecto en false impide que se registre cada tecla nueva dentro del permiso como una nueva linea en caso de usar auto-guardado. |
