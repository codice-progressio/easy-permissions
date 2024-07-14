const fs = require("fs")
const guard = require("express-jwt-permissions")()


/**
 * Object that stores the descriptions of permissions.
 * @type {Object}
 */
const permissions_description = {}
/**
 * Object representing permissions.
 * @type {Object}
 */
const permissions_permission = {}
/**
 * Saves timer for saving permissions.
 * @type {undefined}
 */
let timer = undefined

/**
 * Un objeto con clave fichero1, fichero2
 */
let rutaCompletaFichero = {}

const configuraciones = {
  // El path del fichero en el cual se van a estar agregando
  // los permisos.
  path: "./",
  // El nombre del archivo que se buscara.
  nombreArchivoPermisos: "permisos.seguridad.js",
  // El nombre de la carpeta
  nombreCarpetaPermisos: "seguridad",
  // Generalmente recibe process.env.NODE_ENV
  modoProduccion: true,
  // Parametro que se adjunta al request y contiene el
  // permiso definido el middleware. Su mejor función es
  // cuando hay un error de permisos y se quiere saber cual fue
  // el permiso solicitado.
  nombreParametroRequest: "permisoSolicitado",
  // Por defecto detiene la generación del archivo. Mantenerlo por defecto
  // en false impide que se registre cada tecla nueva dentro del permiso como
  // una nueva linea en caso de usar auto-guardado.
  generarPermisos: false,
}

module.exports.configuraciones = configuraciones

module.exports.config = function (conf = configuraciones) {
  Object.keys(conf).forEach(x => {
    if (configuraciones.hasOwnProperty(x)) configuraciones[x] = conf[x]
    else throw new Error(msj("[ easyPermissions ] ", "Opcion invalida: " + x))
  })

  const tieneError = comprobarConfiguraciones(configuraciones)
  if (tieneError) throw new Error(msj("[ easyPermissions ] ", tieneError))

  rutaCompletaFichero = comprobarFicheroPermisos(configuraciones)
}

function comprobarFicheroPermisos(conf) {
  //El fichero debe de existir, si no se crea.
  const dir = conf.path.concat(conf.nombreCarpetaPermisos)
  const file = conf.nombreArchivoPermisos
  const file2 = "_" + conf.nombreArchivoPermisos
  const dirFichero = dir.concat("/" + file)
  const dirFichero2 = dir.concat("/" + file2)

  if (!fs.existsSync(dir)) fs.mkdirSync(dir)

  let datos = `const permisos = {\r\n\r\n}\r\nmodule.exports = permisos`

  if (!fs.existsSync(dirFichero)) fs.appendFileSync(dirFichero, datos)
  if (!fs.existsSync(dirFichero2)) fs.appendFileSync(dirFichero2, datos)

  return { fichero1: dirFichero, fichero2: dirFichero2 }
}

function comprobarConfiguraciones(conf) {
  // El path debe ser obligatorio
  if (!conf.hasOwnProperty("path")) return "Debes definir 'path'"
  //   El path no puede estar vacio
  if (conf.path === null || conf.path?.length === 0)
    return "El path no puede ser nulo"

  if (
    conf.nombreCarpetaPermisos === null ||
    conf.nombreCarpetaPermisos?.length === 0
  )
    return "El nombre de la carpeta no puede ser nulo"

  if (conf.nombreParametroRequest?.length === 0)
    return "nombreParametroRequest no puede estar vacio"

  //Si todo esta correcto mandamos null
  return
}

/**
 *Comprueba que el permiso esta definido. Si el estring
 esta definido lo retorna, si no, manda un error. 
 *
 * @param {string} permiso El permiso que se quiere definir
 * @param {boolean} esMiddleware Por defecto en true. Retorna un middleware en 
 * lugar de retornar explicitamente el permiso. Esto se usa para comprobar los 
 * permisos en modo producción, y en modo desarrollo, escribe el permiso en el 
 * fichero definido. 
 * @returns String | Middleware
 */
module.exports.$ = (
  permiso,
  descripcion = "Sin descripción",
  opciones = {
    esMiddleware: true,
  }
) => {
  // En caso de que sea midleware debe retornar una funcion
  const funcion = function (req, res, next) {
    //   Para fines de control, adjuntamos el mensaje de error en el req
    // con el nombre definido en la configuracion
    req[configuraciones.nombreParametroRequest] = permiso
    return guard.check(permiso)(req, res, next)
  }

  try {
    
    const data = require(rutaCompletaFichero.fichero1)
    // En modo produccion, o en caso de que el permiso exista, regresa el permiso
    // la funcion segun este definido.
    if (configuraciones.modoProduccion || permiso in data )
      return opciones.esMiddleware ? funcion : permiso

    // Evita la continua generacion de elementos si no has terminado de
    // escribir permisos
    if (!configuraciones.generarPermisos)
      return opciones.esMiddleware ? funcion : permiso

    permissions_description[permiso] = descripcion
    permissions_permission[permiso] = permiso

    function timer_execution() {

      console.log("Guardando")
      const header = "const permisos = {\n"
      const footer = "\n}\n\nmodule.exports = permisos"


      const permissions_description_string = JSON.stringify(permissions_description, null, 2).replace(/{/g, header).replace(/}/g, footer);
      const permissions_permission_string = JSON.stringify(permissions_permission, null, 2).replace(/{/g, header).replace(/}/g, footer);
      
      fs.writeFileSync(rutaCompletaFichero.fichero1, permissions_description_string)
      fs.writeFileSync(rutaCompletaFichero.fichero2, permissions_permission_string)
      clearTimeout(timer)
    }

    if (!timer) timer = setTimeout(() => {
      timer_execution()
    }
      , 1000
    )


  } catch (error) {
    throw new Error(msj("[ easyPermissions ] ", error))
  }
  // Y para poder seguir trabajando en modo desarrollo
  // devolvemos la funcion
  return opciones.esMiddleware ? funcion : permiso
}

function msj(textRed, text) {
  return `\x1b[0m\x1b[31m\x1b[40m${textRed}\x1b[0m${text}`
}
