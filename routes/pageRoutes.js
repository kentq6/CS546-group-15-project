import { Router } from "express";
import * as userHandlers from '../controllers/userController.js'
import * as pageHandlers from '../controllers/pageController.js'
import { authenticate, logout } from '../middleware/auth.js';

const router = Router()

router.route('/landing')
    /* landing page route - public access */
    .get(pageHandlers.renderLandingPage)


router.route('/login')
    /* redirects logged in users to '/loggedInLanding', else shows login form */
    .get
        ( pageHandlers.redirectUserToLoggedInLandingIfLoggedIn
        , pageHandlers.renderLoginPage
        )
    // redirects a successful login to '/loggedInLanding'
    .post(userHandlers.loginHandler)


router.route('/signup')
    /* signup page route - shows registration form */
    .get(pageHandlers.renderSignupPage)


router.route('/loggedInLanding')
    .get
        ( authenticate
        , pageHandlers.passUserToViews
        , pageHandlers.renderLoggedInLandingPage
        )

/* clears authentication cookie and redirects to login page */
router.route('/logout')
    .post(logout)

router.route('/')
    // baseURL redirects logged in users to '/loggedInLanding' and guests to '/landing'
    .get
        ( pageHandlers.redirectUserToLoggedInLandingIfLoggedIn
        , pageHandlers.redirectUserToLanding
        )

export default router

    
