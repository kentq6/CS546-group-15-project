import { Router } from "express";

const router = Router()

router
    .get('/landing', (req, res) => {
        return res.render('landing')
    })
    .get('/login', (req, res) => {
        return res.render('login')
    })
    .get('/signup', (req, res) => {
        return res.render('signup')
    })
    .get('/', (req, res) => {
        return res.redirect('/landing')
    })

export default router

    
