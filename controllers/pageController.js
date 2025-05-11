
export function renderLandingPage (req, res) {
    return res.render('landing', {
        title: 'Welcome',
        landingPage: true
    }) 
}

export function renderLoginPage (req, res) {
    return res.render('login', {
        title: 'Login',
        landingPage: false
    })
}

export function renderSignupPage (req, res) {
    return res.render('signup', {
        title: 'Sign Up',
        landingPage: false
    })
}

export function renderLoggedInLandingPage (req, res) {
    return res.render('loggedInLanding', {
        title: 'Dashboard',
        landingPage: false
    })
}

export function redirectUserToLoggedInLandingIfLoggedIn (req, res, next) {
    if (req.cookies?.authToken) {
        return res.redirect('/loggedInLanding')
    } else {
        next()
    }
}

export function redirectUserToLanding (req, res) {
    return res.redirect('/landing')
}

/**
 * Middleware to pass user data to all views.
 * This makes the user object available in all templates
 * accessed via res.locals.user
 */
export function passUserToViews(req, res, next) {
    res.locals.user = req.user
    next()
}

