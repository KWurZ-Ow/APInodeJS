const router = require("express").Router()
const { body, validationResult } = require('express-validator');

async function alreadyExist(db, name) {
    const movie = await db.collection('movies').where("name", "==", name).get()
    return (movie.size != 0)
}

const moviesRouter = (db) => {
    router.get("/", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        }else{
            let movies = []
            await db.collection('movies').get().then(val => val.forEach(doc => {
                movies.push({ id: doc.id, ...doc.data() })
            }))
            res.send(movies)
        }
    })
    router.get("/:id", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        }else{
            try {
                const movie = await db.collection('movies').doc(req.params.id).get()
                if(!movie.exists) throw new Error("404")
                res.send(movie.data())
            } catch (error){
                res.status(404).send({error: "not found"})
            }
        }
    })
    router.post("/",
    body('name').notEmpty().isString().escape(),
    body('author').notEmpty().isString().escape(),
    body('category').notEmpty().isString().escape().isLength({ min: 20, max: 20 }),
    body('description').notEmpty().isString().escape(),
    body('img').notEmpty().isString().escape(),
    body('video').notEmpty().isString().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (Object.keys(req.body).length === 0){
            res.status(422).send({error: "Body can't be empty !"})
        } else if (await alreadyExist(db, req.body.name)){
            res.status(403).send({error: "movie already exists"})
        } else {
            try {
                const result = await db.collection("movies").add({
                    name: req.body.name,
                    author: req.body.author,
                    img: req.body.img,
                    video: req.body.video,
                    category: req.body.category,
                    description: req.body.description,
                    likes: 0
                })
                res.send({code: result.id})
            } catch(error) {
                res.status(500).send({error: error.toString()})
            }
        }
    })
    router.patch("/:id",
    body('name').notEmpty().isString().escape().optional(),
    body('author').notEmpty().isString().escape().optional(),
    body('category').notEmpty().isString().escape().optional().isLength({ min: 20, max: 20 }),
    body('description').notEmpty().isString().escape().optional(),
    body('img').notEmpty().isString().escape().optional(),
    body('video').notEmpty().isString().escape().optional(), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (Object.keys(req.body).length === 0){
            res.status(422).send({error: "Body can't be empty !"})
        } else {
            try{
                let toInsert = {}
                if(req.body.name) toInsert.name = req.body.name
                if(req.body.author) toInsert.author = req.body.author
                if(req.body.category) toInsert.category = req.body.category
                if(req.body.description) toInsert.description = req.body.description
                if(req.body.img) toInsert.img = req.body.img
                if(req.body.video) toInsert.video = req.body.video
                db.collection('movies').doc(req.params.id).update(toInsert)
                res.send({message: "modified successfully"})
            }catch(error){
                res.status(422).send({error: "unauthorized field"})
            }
        }
    })
    router.patch("/:id/like", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        } else {
            try{
                const movie = await db.collection('movies').doc(req.params.id).get()
                db.collection('movies').doc(req.params.id).update({likes: movie.data().likes + 1})
                res.send({ likes: movie.data().likes + 1})
            } catch (error){
                res.status(404).send({error: "not found"})
            }
        }
    })
    router.delete("/:id", async (req, res) => {
        if (Object.keys(req.body).length != 0){
            res.status(422).send({error: "Body must be empty !"})
        } else {
            try{
                const movie = await db.collection('movies').doc(req.params.id).get()
                if (movie.exists){
                    db.collection('movies').doc(req.params.id).delete()
                    res.send({message: "successfully deleted"})
                }else{
                    res.status(404).send({error: "not found"})
                }
            } catch (error){
                res.status(500).send({error: error.toString()})
            }
        }
    })
    
    return router
}

module.exports = moviesRouter