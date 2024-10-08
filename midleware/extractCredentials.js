module.exports = {
    extractCredentials: (req, res, next) => {
        if (req && req.cookies) {
            if (!req.cookies.login || !req.cookies.password) {
                res.redirect('/login');
            } else {
                req.user = {
                    login: req.cookies.login,
                    password: req.cookies.password,
                    name: req.cookies.name,
                    id: req.cookies.id
                };
                next();
            }
        } else {
            throw new Error("Error 'req' param!");
        }
    }
}