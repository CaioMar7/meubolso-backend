require("express-async-errors")

const express = require("express")

const routes = require("./src/routes")

const app = express()
app.use(express.json())

app.use(routes)
const AppError = require("./src/utils/AppError")

app.use( (error, request, response, next) => {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    console.error(error)

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    })
})

const migrationsRun = require("./src/database/sqlite/migrations")
migrationsRun()

const PORT = 3333

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}.`)) 