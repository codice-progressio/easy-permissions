const assert = require("assert")
const easyPermissions = require("../index")

describe("Hola mundo", () => {
  it("Debe retornar hola mundo", () => {
    assert.strictEqual(easyPermissions(), "Hola mundo")
  })
})
