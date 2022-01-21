const router = require("express").Router()
const { body, validationResult } = require('express-validator');

async function alreadyExist(db, name) {
    const category = await db.collection('categories').where("name", "==", name).get()
    return (category.size != 0)
}

const moviesRouter = (db) => {
    router.get("/", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        } else {
            let categories = []
            await db.collection('categories').get().then(val => val.forEach(doc => categories.push({ id: doc.id, ...doc.data() })))
            res.send(categories)
        }
    })
    router.get("/:id", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        } else {
            try {
                try {
                    const category = await db.collection('categories').doc(req.params.id).get()
                    if(!category.exists) throw new Error("404")
                    res.send(category.data())
                } catch (error){
                    res.status(404).send({error: "not found"})
                }
            }catch (error){
                res.status(500).send({error: error})
            }
        }
    })
    router.post("/",
    body('name').notEmpty().isString().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (Object.keys(req.body).length === 0){
            res.status(422).send({error: "Body can't be empty !"})
        } else if (await alreadyExist(db, req.body.name)){
            res.status(403).send({error: "category already exists"})
        } else {
            try {
                const result = await db.collection("categories").add({name: req.body.name})
                res.send({id: result.id})
            } catch(error) {
                res.status(500).send({error: error.toString()})
            }
        }
    })
    router.put("/:id",
    body('name').notEmpty().isString().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (Object.keys(req.body).length === 0){
            res.status(422).send({error: "Body can't be empty !"})
        } else {
            try {
                db.collection('categories').doc(req.params.id).update({name: req.body.name})
                res.send({message: "modified successfully"})
            }catch(error){
                res.status(422).send({error: "unauthorized field"})
            }
        }
    })
    router.delete("/:id", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        } else {
            const category = await db.collection('categories').doc(req.params.id).get()
            if (category.exists){
                db.collection('categories').doc(req.params.id).delete()
                res.send({message: "successfully deleted"})
            }else{
                res.status(404).send({error: "not found"})
            }
        }
    })
    
    return router
}

module.exports = moviesRouter