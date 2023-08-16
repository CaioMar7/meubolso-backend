
const AppError = require("../utils/AppError")
const knex = require("../database/knex")

class EntriesController {

    async create(request, response) {
        const { description, type, category, value } = request.body
        const { user_id } = request.params

        const checkUserExists = await knex("users").where("id", user_id).first()

        if (!checkUserExists) {
            throw new AppError("Esse usuário não foi encontrado!")
        }

        if (!value) {
            throw new AppError("A entrada precisa de um valor.")
        }

        if (!type) {
            throw new AppError("A entrada precisa de um tipo.")
        }
        

        await knex("entries").insert({
            description, type, category, value, user_id
        })


        return response.status(201).json({ description, type, category, value } )
    }

    async index(request, response) {
        const { user_id } = request.params
        const entries = await knex("entries").where("user_id", user_id).orderBy("created_at", "desc");
    
        return response.json(entries)
        
    }

    async show(request, response) {
        const { user_id, id } = request.params
        
        const checkUserExists = await knex("users").where("id", user_id).first()

        if (!checkUserExists) {
            throw new AppError("Esse usuário não foi encontrado!")
        }

        const entrie = await knex("entries").where("user_id", user_id).where("id", id)

        return response.json(entrie)
    }

    async delete(request, response) {
        const { id } = request.params

        const checkEntrieExists = await knex("entries").where("id", id).first()

        if (!checkEntrieExists) {
            throw new AppError("Essa entrada não foi encontrada!")
        }

        await knex("entries").where("id", id).delete()

        return response.json(checkEntrieExists)
    }


    async update(request, response) {
        const { description, type, category, value } = request.body

        const { id } = request.params

        const entrie = await knex("entries").where("id", id).first()

        if(!entrie) {
            throw new AppError("Essa entrada não foi encontrada!")
        }

        entrie.description = description ?? entrie.description
        entrie.type = type ?? entrie.type
        entrie.category = category ?? entrie.category
        entrie.value = value ?? entrie.value

        await knex("entries").where("id", id).first().update({
            description,
            type,
            category,
            value,
            updated_at: knex.fn.now()
        })

        return response.status(200).json("Alteração realizada com sucesso!")
    }
}

module.exports = EntriesController