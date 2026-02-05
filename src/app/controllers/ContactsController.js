import { prisma } from "../../database/prisma.js";
import * as Yup from 'yup';

class ContactsController {

    async index(req,res) {
        const limit = parseInt(req.query.limit) || 25;
        const skip = (parseInt(req.query.page) - 1) * limit || 0;
        const sort = req.query.sort || 'id';
        const where = {customer_id: parseInt(req.params.customerId)};
        const order = req.query.order || 'asc';
        const contact = await prisma.contacts.findMany({
            include: {customer: true,} ,
            where: where,
            orderBy: { [sort]: order },
            take: limit,   // limit
            skip: skip,    // offset
  });   
        if (contact.length === 0) {
            return res.status(404).json({ error: "No contacts found" });
        }
        return res.json(contact);
    }
    async showAll(req,res) {
        const limit = parseInt(req.query.limit) || 25;
        const skip = (parseInt(req.query.page) - 1) * limit || 0;
        const sort = req.query.sort || 'id';
        const order = req.query.order || 'asc';

        const contacts = await prisma.contacts.findMany({
            include: {customer: true},
            orderBy: { [sort]: order },
            take: limit,   // limit
            skip: skip,    // offset
            
        })

        if(contacts.length === 0){
            return res.status(404).json({error: "No contacts found"})
        }
        return res.status(200).json(contacts)
    }


    async show(req,res) {
        const id = parseInt(req.params.id)
        const contact = await prisma.contacts.findUnique({
            include: {customer: true,} ,
            where: { id: id }
        });
        if(!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        return res.status(200).json(contact);
    }

    async create(req,res) {
            const {name, email} = req.body
            const schema = Yup.object().shape({
                name: Yup.string().required(),
                email: Yup.string().email().required(),
            });
     
            if(!schema.isValidSync(req.body)) {
                return res.status(400).json({ error: "Validation failed" });
            }
    
            const newContact = await prisma.contacts.create({
                data: {
                    name,
                    email,
                    customer_id: parseInt(req.params.customerId)

                }
            })
    
    
            return res.status(201).json(newContact)
        }

    async update(req,res) {
        const id = parseInt(req.params.id)
        const {name, email} = req.body
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
        });
        if(!schema.isValidSync(req.body)) {
            return res.status(400).json({ error: "Validation failed" });
        }
        const contact = await prisma.contacts.update({
            where: {id: id },
            data: {
                name,
                email
            }
        })

        return res.status(200).json(contact);
    }

    async delete(req,res) {
        const id = parseInt(req.params.id)
        await prisma.contacts.delete({
            where: { id: id }
        });
        return res.status(204).send();
    }

}

export default new ContactsController();