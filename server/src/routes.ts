import exporess from "express";
import { celebrate, Joi } from "celebrate"

import multer from "multer";
import multerConfig from "./config/multer";

import PointsControllers from "./controllers/PointsControllers";
import ItemsControllers from "./controllers/ItemsControllers";

const routes = exporess.Router()
const upload = multer(multerConfig)

routes.get('/items', ItemsControllers.index)
routes.get('/points', PointsControllers.index)
routes.get('/points/:id', PointsControllers.show)

routes.post('/pcoints', 
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false
  }),
  PointsControllers.create)

export default routes