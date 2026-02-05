import { prisma } from "../../database/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class SessionsController {

    async create(req,res) {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: email }
        });


        if (!user){
            return res.status(401).json({ error: "User not found" });
        }

        const checkPassword = await bcrypt.compare(password, user.password_hash)
        if (!checkPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }

        return res.json({ 
            user: {
                id: user.id,
                email: user.email,
                name: user.username 
                },
                token: jwt.sign({ id : user.id }, process.env.JWT_SECRET, { expiresIn: "1d" })
            });
        


    }




}


export default new SessionsController()