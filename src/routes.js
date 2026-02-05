import {Router} from "express"
import customers from "./app/controllers/CustomersController"
import contacts from "./app/controllers/ContactsController"
import user from "./app/controllers/UserController"
import session from "./app/controllers/SessionsController"
import auth from "./app/middlewares/auth"
import multer from 'multer'
import multerConfig from './app/middlewares/multer'
import files from './app/controllers/FilesController'

const routes = new Router()
const upload = multer(multerConfig)

//Sessions
routes.post("/users", user.create)
routes.post("/sessions", session.create)
//Usar após o sessions para deixar ele exposto e protejer as demais rotas
routes.use(auth)

//Customers
routes.get("/customers", customers.index)
routes.get("/customers/:id", customers.show)
routes.post("/customers", customers.create)
routes.put("/customers/:id", customers.update)
routes.delete("/customers/:id", customers.destroy)

//Contacts
routes.get("/customers/:customerId/contacts", contacts.index)
routes.get("/contacts", contacts.showAll)
routes.get("/customers/:customerId/contacts/:id", contacts.show)
routes.post("/customers/:customerId/contacts", contacts.create)
routes.put("/customers/:customerId/contacts/:id", contacts.update)
routes.delete("/customers/:customerId/contacts/:id", contacts.delete)

//Users
routes.get("/users", user.index)
routes.get("/users/:id", user.show)

routes.put("/users/:id", user.update)
routes.delete("/users/:id", user.destroy)

//File upload example route
routes.post('/files', upload.single('file'),  files.create)

export default routes