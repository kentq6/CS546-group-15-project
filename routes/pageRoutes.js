import { Router } from "express";

const router = Router()

router
    .get('/landing', (req, res) => {
        res.render('landing', {
            title: 'Welcome',
            landingPage: true
        });
    })
    .get('/login', (req, res) => {
        res.render('login', {
            title: 'Login',
            landingPage: false
        });
    })
    .get('/signup', (req, res) => {
        res.render('signup', {
            title: 'Sign Up',
            landingPage: false
        });
    })
    .get('/', (req, res) => {
        return res.redirect('/landing')
    })

export default router

    
