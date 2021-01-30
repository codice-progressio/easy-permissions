const assert = require("chai").should()
const ep = require("../index")

describe("Configuraciones", () => {
  describe("Defaults", () => {
    ep.config()

    it("configuraciones debe ser un objeto", () => {
      ep.configuraciones.should.be.a("object")
    })

    it("Debe contener las llaves", () => {
      //   Debe de incluir todas estas llaves.
      ep.configuraciones.should.keys([
        "generarPermisos",
        "modoProduccion",
        "nombreArchivoPermisos",
        "nombreCarpetaPermisos",
        "nombreParametroRequest",
        "path",
      ])
    })

    it("Debe tener los valores por defecto", () => {
      ep.configuraciones["path"].should.be.eq("./")
      ep.configuraciones["nombreArchivoPermisos"].should.be.eq(
        "permisos.seguridad.js"
      )
      ep.configuraciones["nombreCarpetaPermisos"].should.be.eq("seguridad")
      ep.configuraciones["modoProduccion"].should.be.eq(true)
      ep.configuraciones["nombreParametroRequest"].should.be.eq(
        "permisoSolicitado"
      )
      ep.configuraciones["generarPermisos"].should.be.eq(false)
    })
  })
})
