import { prisma } from "../../database/prisma.js";
import * as Yup from 'yup';

class CustomersController {
    
    async index(req,res) {

        const limit = parseInt(req.query.limit) || 25;
        const skip = (parseInt(req.query.page) - 1) * limit || 0;
        const sort = req.query.sort || 'id';
        const order = req.query.order || 'asc';
        const customers = await prisma.customer.findMany({
            include: {contacts: true,} ,
            orderBy: { [sort]: order },
            take: limit,   // limit
            skip: skip,    // offset
  });   
        if (customers.length === 0) {
            return res.status(404).json({ error: "No customers found" });
        }
        return res.json(customers);
    }
    async show(req,res) {
        const id = parseInt(req.params.id)
        const customer = await prisma.customer.findUnique({
            where: { id: id }
        });
        if(!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        return res.status(200).json(customer);
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

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email,
                
            }
        })


        return res.status(201).json(newCustomer)
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
 
        const customer = await prisma.customer.update({
            where: { id: id },
            data: {
                name,
                email
            }
        })

        if(!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        return res.json(customer)
    }

    async destroy(req,res) {
        const id = parseInt(req.params.id)
        const deleted = await prisma.customer.delete({
            where: { id: id }
        })
        if(!deleted) {
            return res.status(404).json({ error: "Customer not found" });
        }

        return res.json(deleted)

    } 
}

export default new CustomersController()