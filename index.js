const express = require('express');
const app = express();
const path = require('path');
const config = require('./config');
const user = require('./models/user');
const post = require('./models/post');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//associations
user.belongsTo(post, {
    foreignKey: "id"
});

post.hasMany(user, {
    foreignKey: "created_by_user_id"
});

config.authenticate().then(function () {
    console.log('Database is connected')
})

    .catch(function (err) {
        console.log(err);
    });


//configure multer & storing uploads & name of the upload
const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname); //Name of uploaded file
    }
});

let upload = multer({
    storage: storage
})


//post request for signup
app.post('/signup', function (req, res) {
    console.log(req.file);
    let plainPassword = req.body.password;
    bcrypt.hash(plainPassword, saltRounds, function (err, hash) {
        let user_data = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hash,
            user_name: req.body.user_name,
        };

        //creating a new user

        user.create(user_data).then((result) => {
            res.status(200).send(result);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

});

//user log-in
app.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let user_data = {
        where: { email } // OR {email: email}
    }


//finding user that already exists in the database that uses the corresponded email
user.findOne(user_data).then((result) => {
    if (result) {
        console.log(result);
        bcrypt.compare(password, result.password, function (err, output) {
            console.log(output);
            if (output) {``
                res.status(200).send(result);
            } else {
                res.status(400).send('Incorrect email/password');
            }
        });

    }
    else {
        res.status(404).send('User does not exist');
    }

}).catch((err) => {
    res.status(500).send(err);

});
});

//get request for single user
app.get('/users/:user_id', function (req, res) {
    let id = parseInt(req.params.id);
    user.findByPk(id)
        .then(function (result) {
            res.status(200).send(result);
        }).catch(function (err) {
            res.status(500).send(err);
        });

});


app.get('/users', function (req, res) {
    let user_data = { where: {} };

    if (req.query.id !== undefined) {
        user_data.where.id = req.query.id;
    };
    user.findAll(user_data).then(function (results) {
        res.status(200).send(results);
    }).catch(function (err) {
        res.status(500).send(err);
    });
});

//patch request for deleting user
app.patch('/user/:id', upload.single('image'), function (req, res) {
    const { first_name, last_name, email, password, user_name } = req.body;

    let id = parseInt(req.params.id);
    user.findByPk(id)
        .then(function (result) {
            if (result) {
                result.first_name = first_name;
                result.last_name = last_name;
                result.email = email;
                result.password = password;
                result.user_name = user_name;

                if (req.file) {
                    fs.unlink('./uploads' + result.Image, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        console.log('Image has been removed');
                    });
                    result.Image = req.file ? req.file.filename : null;
                }
                result.save().then(function (req, res) {
                    res.status(200).send(result);
                })
                    .catch(function (err) {
                        res.send(err);
                    });
            } else {
                res.status(404).send('User not found');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
})

//post request
app.post('/post', upload.single('image'), function (req, res) {
    console.log(req.file)
    const { user_id, item_name, description, location } = req.body
    let post_data = {
        user_id,
        item_name,
        description,
        location,
        Image: req.file ? req.file.filename : null
    }

    posts.create(post_data).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        res.status(500).send(err);
    });
});


//get request
app.get('/post/:id', function (req, res) {
    let id = parseInt(req.params.id);
    user.findByPk(id)
        .then(function (result) {
            res.status(200).send(result);
        }).catch(function (err) {
            res.status(500).send(err);
        });

})


app.get('/post', function (req, res) {
    let post_data = { where: {} };

    if (req.query.user_id !== undefined) {
        post_data.where.user_id = req.query.user_id;
    };

    if (req.query.item_name !== undefined) {
        post_data.where.item_name = req.query.item_name;
    };

    if (req.query.description !== undefined) {
        post_data.where.description = req.query.description;
    };

    if (req.query.location !== undefined) {
        post_data.where.location = req.query.location;
    };

    post.findAll(post_data).then(function (results) {
        res.status(200).send(results);
    }).catch(function (err) {
        res.status(500).send(err);
    });
});

//patch request
app.patch('/post/:id', upload.single('image'), function (req, res) {
    const { item_name, description, location } = req.body;

    let id = parseInt(req.params.id);
    user.findByPk(id)
        .then(function (result) {
            if (result) {
                result.item_name = item_name;
                result.description = description;
                result.location = location;

                if (req.file) {
                    fs.unlink('./uploads' + result.Image, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        console.log('Image has been removed');
                    });
                    result.Image = req.file ? req.file.filename : null;
                }
                result.save().then(function (req, res) {
                    res.status(200).send(result);
                })
                    .catch(function (err) {
                        res.send(err);
                    });
            } else {
                res.status(404).send('User not found');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
})


//delete request
app.delete('/post/:id', function (req, res) {
    let id = parseInt(req.params.id);

    posts.findByPk(id)
        .then(function (result) {
            if (result) {
                result.destroy().then(function () {
                    res.status(200).send(result);
                }).catch(function (err) {
                    res.status(500).send(err);
                });

            } else {
                res.status(404).send('User not found');
            }
        })
        .catch(function (err) {
            res.send(err);
        });
})


//running server
app.listen(3000, function () {
    console.log('Server running on port 3000...');
});
