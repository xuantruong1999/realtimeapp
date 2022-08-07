
const login = (req, res) => {
    res.render('account/login.pug', {title: "Login Page"});
}

module.exports = {
    login
}