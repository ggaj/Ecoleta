import { Request, Response, request } from "express";
import knex from "../database/connection";

class PointsControllers {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whastapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body
  
    const trx = await knex.transaction()
    
    const point = {
      image: request.file.originalname,
      name,
      email,
      whastapp,
      latitude,
      longitude,
      city,
      uf
    }

    const insertedId = await trx('points').insert(point)
  
    const point_id = insertedId[0]
  
    const pointItems = items
    .split(',')
    .map((item:string) => Number(item.trim()))
    .map((item_id: number) => {
      return {
        item_id,
        point_id
      }
    })
  
    await trx('point_items').insert(pointItems)

    await trx.commit()

    return response.json({
      point_id,
      ...point
    })
  }

  async show(request: Request, response: Response) {
    const { id } = request.params
    
    const point = await knex('points').where('id', id).first()

    if(!point){
      return response.status(400).json({ message: "Point not found" })
    }

    const serializedPoint = {
      ...point,
      image_url: `http://localhost:3333/uploads/${point.image}`
    }

    const items = knex("items")
    .join("point_items", "item.id", "=", "point_items.item_id")
    .where("point_items.point_id", id)
    .select("items.title")

    return response.json({point: serializedPoint, items})
  }

  async index(reques: Request, response: Response){
    const { city, uf, items } = request.query

    const parsedItems = String(items).split(',').map(item => Number(item.trim()))

    const points = await knex('Points')
    .join('point_items', 'points.id', '=', 'point_items.point_id')
    .whereIn('point_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*')

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://localhost:3333/uploads/${point.image}`
      }
    })

    return response.json(serializedPoints)
  }
}

export default new PointsControllers