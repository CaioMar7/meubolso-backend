const { Router } = require("express")

const EntriesController = require("../controllers/EntriesController")

const entriesRoutes = Router()

const entriesController = new EntriesController()

entriesRoutes.post("/:user_id", entriesController.create)
entriesRoutes.get("/:user_id", entriesController.index)
entriesRoutes.get("/:user_id/:id", entriesController.show)
entriesRoutes.delete("/:id", entriesController.delete)
entriesRoutes.put("/:id", entriesController.update)


module.exports = entriesRoutes