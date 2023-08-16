const { hash, compare } = require("bcryptjs")

const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")

class UsersController {

    async create(request, response) {
        const { username, email, password, confirm_password } = request.body
        
        const database = await sqliteConnection()

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if (checkUserExists) {
            throw new AppError("Esse email já está sendo utilizado.")
        }
        
        if (!username) {
            throw new AppError("Um nome precisa ser enviado.")
        }

        if(password != confirm_password) {
            throw new AppError("As senhas estão diferentes.")
        }

        const hashedPassword = await hash(password, 8)
        
        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword])

        return response.status(201).json("Seu usuário foi criado com sucesso!")
    }

    async show(request, response ) {
        const { id } = request.params
        
        const database = await sqliteConnection()
        const checkUserExists = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if (!checkUserExists) {
            throw new AppError("Esse usuário não foi encontrado!")
        }

        return response.status(200).json(checkUserExists)
        
    }

    async delete(request, response) {
        const { id } = request.params

        const database = await sqliteConnection()

        const checkUserExists = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if (!checkUserExists) {
            throw new AppError("Esse usuário não foi encontrado!")
        }

        await database.run("DELETE FROM users WHERE id = (?)", [id])

        return response.status(200).json(checkUserExists)
    }

    async index(request, response) {
        const database = await sqliteConnection()
        const usersList = await database.get("SELECT * FROM users")

        return response.status(200).json(usersList)
    }

    async update(request, response ) {
        const { name, email, password, old_password } = request.body
        
        const  id  = request.user.id

        const database = await sqliteConnection()

        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if(!user) {
            throw new AppError("Usuário não encontrado!")
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])
        
        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Esse email já está em uso!")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if ( password && !old_password) {
            throw new AppError("Você precisa informar a senha atual para cadastrar sua nova senha!")
        }

        if ( password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)

            if ( !checkOldPassword ) {
                throw new AppError("A senha atual está incorreta!")                
            }

            user.password = await hash(password, 8)            
        }

        await database.run(` 
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        WHERE id = ?`,
        [user.name, user.email, user.password, id]
        )

        return response.status(200).json("Alteração realizada com sucesso!")
    }
}

module.exports = UsersController