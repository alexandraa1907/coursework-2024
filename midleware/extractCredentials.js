const db = require('../db');

module.exports = {
    extractCredentials: async (req, res, next) => {
        if (req && req.cookies) {
            if (!req.cookies.login || !req.cookies.password) {
                res.redirect('/login');
            } else {
                const workerResult = await db.query(
                    'SELECT * FROM ur_cons.worker WHERE login = $1::text AND password = $2::text',
                    [req.cookies.login, req.cookies.password]
                );
                console.log(req.cookies);
                    console.log(workerResult.rows);
                if (workerResult.rows.length < 0) {
                    res.redirect('/login');
                    
                    return;
                }
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