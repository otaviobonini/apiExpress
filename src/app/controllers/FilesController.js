import { prisma } from "../../database/prisma.js";


class FilesController {

    async create(req, res) {
        
        const file = await prisma.file.create({
            data: {
                name: req.file.filename,
                path: req.file.path,
                user_id: req.userId
            }
        })
        res.json({ message: 'File uploaded successfully', file })

    }


}

export default new FilesController()