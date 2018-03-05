import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import expressValidator from 'express-validator';
import mongojs from 'mongojs';

let db = mongojs('customerapp', ['users']);
let app = express();

app.use(expressValidator({errorFormatter: (param, msg, value) => {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

    while (namespace.length) {
        formParam += '[' + namespace.length + ']';
    }

    return {
        param: formParam,
        msg: msg,
        value: value
    }
}}));

app.use((req, res, next) => {
   res.locals.errors = null;
   next();
});

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    db.users.find((err, user) => {
        res.render('index', {
            title: 'Customers',
            users: user
        })
    });

});

app.post('/users/add', (req, res) => {
    console.log('Form submitted');

    req.check('first_name', 'First Name is Required.').notEmpty();
    req.check('last_name', 'Last Name is Required.').notEmpty();
    req.check('email', 'Email is Required.').notEmpty();
    req.check('email', 'Email not valid.').isEmail();

    let errors = req.validationErrors();

    let data = {
        title: 'Customers',
    };

    if (errors) {
        console.log(errors);
        data.errors = errors;
        res.render('index', data);
    } else {
        let newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        };
        db.users.insert(newUser, (err) => {
            if(err) {
                console.log(err);
            }
            res.redirect('/');
        });
    }

});

app.delete('/users/:id', (req, res) => {
    db.users.remove({_id: mongojs.ObjectId(req.params.id)}, (err) => {
        if(err) {
            console.log(err);
        } else {
            res.status(200).send();
        }
    })
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
