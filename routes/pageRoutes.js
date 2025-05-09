import { Router } from "express";
import * as userHandlers from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js';
const router = Router()


/* middleware to pass user data to all views
 * this makes the user object available in all templates
 * accessed via res.locals.user
 */
const passUserToViews = (req, res, next) => {
    res.locals.user = req.user;
    next();
};



/* global middleware that checks for authentication
 * if authToken exists in cookies:
 *   - authenticates the user
 *   - passes user data to views
 * if no authToken:
 *   - continues without authentication
 */
router.use((req, res, next) => {
    if (req.cookies.authToken) {
        return authenticate(req, res, () => {
            passUserToViews(req, res, next);
        });
    }
    next();
});



/* route definitions */
router
    /* landing page route - public access */
    .get('/landing', (req, res) => {
        res.render('landing', {
            title: 'Welcome',
            landingPage: true
        });
    })


    /* login page route
     * redirects to dashboard if already logged in
     * otherwise shows login form
     */
    .get('/login', (req, res) => {
        if (req.cookies.authToken) {
            return res.redirect('/loggedInLanding');
        }
        res.render('login', {
            title: 'Login',
            landingPage: false
        });
    })



    /* login form submission handler
     * processes login credentials
     * uses userController for authentication
     */
    .post('/login', (req, res, next) => {
        // console.log('Login route hit with body:', req.body);         I ADDED A BCRYPT HASH THE PASSWORD IN OUR DB. IF YOU WANT TO SEE THE PASSWORDS and U FORGOT WHAT IT WAS, UNCOMMENT THIS. 
        userHandlers.loginHandler(req, res, next);
    })


    /* signup page route - shows registration form */
    .get('/signup', (req, res) => {
        res.render('signup', {
            title: 'Sign Up',
            landingPage: false
        });
    })



    /* dashboard route - requires authentication
     * protected by authenticate middleware
     * shows user's dashboard after login
     */
    .get('/loggedInLanding', authenticate, (req, res) => {
        res.render('loggedInLanding', {
            title: 'Dashboard',
            landingPage: false
        });
    })



    /* logout handler
     * clears authentication cookie
     * redirects to login page
     */
    .post('/logout', (req, res) => {
        res.clearCookie('authToken');
        res.redirect('/login');
    })



    /* root route handler
     * redirects to appropriate page based on auth status:
     * - logged in users -> dashboard
     * - guests -> landing page
     */
    .get('/', (req, res) => {
        if (req.cookies.authToken) {
            return res.redirect('/loggedInLanding');
        }
        return res.redirect('/landing');
    });

export default router

    
