import { prisma } from '../../database/prisma'
import * as Yup from 'yup'
import bcrypt from "bcrypt"
import Mail from "../../lib/Mail"

class UserController    {

    async index(req,res) {
        const limit = parseInt(req.query.limit) || 25;
        const skip = (parseInt(req.query.page) - 1) * limit || 0;
        const sort = req.query.sort || 'id';
        const order = req.query.order || 'asc';
        const users = await prisma.user.findMany({
            select: {
                id: true,
                created_at: true,
                updated_at: true,
                email: true,
                username: true,
                provider: true

            },
            orderBy: { [sort]: order },
            take: limit,   // limit
            skip: skip,    // offset
        })
        if (users.length === 0){
            return res.status(404).json({error: "No users found"})
        }
        return res.status(200).json(users)
    }
    async show(req,res) {
        const id = req.params.id
        const user = await prisma.user.findUnique({
            where: {id : parseInt(id)},
            select: {
                id: true,
                created_at: true,
                updated_at: true,
                email: true,
                username: true,
                provider: true,
                files: true,
            }
        })
        if (!user){
            return res.status(404).json({error: "No user found"})

        }
        return res.status(200).json(user)
    }
    async create(req,res){
        const {password, username, email } = req.body
        const schema = Yup.object().shape({
            username: Yup.string().required(),
            password: Yup.string().required(),
            passwordConfirmation: Yup.string()
            .required()
            .oneOf([Yup.ref("password")], "Passwords must match"),
            email: Yup.string().email().min(6).required()
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({error: "error on validate schema"})
        }

        const userExist = await prisma.user.findUnique({
            where: {email}
        })

        if (userExist){
            return res.status(409).json({error: "Email ja está sendo usado"})
        }

        const password_hash = await bcrypt.hash(password, 10)


        const user = await prisma.user.create({
            data: {
                password_hash,
                username,
                email, 
                provider: false,
            }
        })

        await Mail.send({
            to: `${user.username} <${user.email}>`,
            subject: "Bem-vindo ao nosso sistema",
            text: `Olá ${user.username}, obrigado por se cadastrar!`,
        })

        
        return res.status(201).json(user)
    
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            username: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when("oldPassword", (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            passwordConfirmation: Yup.string().when("password", (password, field) =>
                password
                    ? field.required().oneOf([Yup.ref("password")], "Passwords must match")
                    : field
            ),
        })

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: "error on validate schema" })
        }

        const id = parseInt(req.params.id)
        const { oldPassword, password, username, email } = req.body

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                provider: true,
                password_hash: true,
                created_at: true,
                updated_at: true,
            },
        })

        if (!user) {
            return res.status(404).json({ error: "No user found" })
        }

        if (email && email !== user.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            })

            if (emailTaken) {
                return res.status(409).json({ error: "Email ja está sendo usado" })
            }
        }

        const dataToUpdate = {}
        if (username) dataToUpdate.username = username
        if (email) dataToUpdate.email = email

        if (oldPassword) {
            const checkPassword = await bcrypt.compare(oldPassword, user.password_hash)

            if (!checkPassword) {
                return res.status(401).json({ error: "Old password does not match" })
            }

            dataToUpdate.password_hash = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                created_at: true,
                updated_at: true,
                email: true,
                username: true,
                provider: true,
            },
        })

        return res.status(200).json(updatedUser)
    }

    async destroy(req, res) {
        const id = parseInt(req.params.id)

        const userExists = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!userExists) {
            return res.status(404).json({ error: "No user found" })
        }

        await prisma.user.delete({
            where: { id },
        })

        return res.status(204).send()
    }

}

export default new UserController()