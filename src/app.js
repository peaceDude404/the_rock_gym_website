const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require('multer');
const axios = require('axios');
const e = require("express");
const fast2sms = require('fast-two-sms');
require('dotenv').config();

var d = Date.now();

// console.log(d.getYear());

function strToInt(s) {
    var y = "", m = "", d = "";
    for (var i = 0; i < req.body.admission.length; i++) {
        if (i >= 0 && i <= 3) {
            y += req.body.admission[i];
        }
        if (i >= 5 && i <= 6) {
            m += req.body.admission[i];
        }
        if (i >= 8 && i <= 9) {
            d += req.body.admission[i];
        }
    }
    var year = parseInt(y);
    var month = parseInt(m);
    var day = parseInt(d);
    console.log(year + ' ' + month + ' ' + day);
    return { year, month, day };
}

function dateToStr(date) {
    var str = "";
    for (var i = 0; i <= 9; i++) {
        str += date[i];
    }
    return str;
}

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', "ejs");
app.use(express.static('public'));

const db = 'mongodb+srv://therockgym:therockgym1234@cluster0.cxxla9l.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(db).then(() => {
    console.log('db connected');
}).catch((err) => console.log('error occured'));


//  STORAGE

const Storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req,file,cb) => {
        cb(null,file.originalname)
    }
});

const upload = multer({
    storage: Storage,
}).single('testImage')

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/registration', (req, res) => {
    res.render('registration');
})

app.get('/allmembers', (req, res) => {
    MemberDetails.find().then((result) => {
        res.render('allmembers', { result });
    }).catch((err) => {
        res.send('Some error occured!!');
    });
})

function checkPending(date) {
    return true;
}

app.get('/pending', (req, res) => {
    MemberDetails.find().then((result) => {
        console.log(result);
        res.render('pending', {
            result
        });
    }).catch((err) => {
        res.send('Some error occured!!');
    });
})

app.get('/upcoming', (req, res) => {
    MemberDetails.find().then((result) => {
        res.render('upcoming', { result });
    }).catch((err) => {
        res.send('Some error occured!!');
    });
})

app.get('/updateData/:id', (req, res, next) => {
    MemberDetails.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
        if (err) {
            res.send("Some error occured!");
            next(err);
        }
        else {
            res.render('update', { data: docs });
        }
    })
});

app.post('/editdata/:id', (req, res, next) => {
    console.log(req.body.rollno)
    if (req.body.admission != "" && req.body.name != "" && req.body.address != "" &&
        req.body.rollno != "" && req.body.mobile != "" && req.body.locker != "" &&
        req.body.timing != "")
        MemberDetails.findByIdAndUpdate({ _id: req.params.id }, req.body, (err, docs) => {
            if (err) {
                res.send("Some error occured!");
                next(err);
            }
            else {
                res.redirect('/');
            }
        })
    else {
        res.send('Value cannot be null!');
    }
})



//  MESSAGE IMPLEMENTATION


app.get('/pendingMessageUser/:id', (req, res, next) => {
    MemberDetails.findById(req.params.id, async function (err, docs) {
        if (err) {
            res.send("Some error occured!");
            next(err);
        } else {
            var options = {authorization : process.env.API_KEY , message : 'This message is from The Rock Gym. Your Gym payment is pending kindly deposit your fees.' ,  numbers : [docs.mobile]};
            await fast2sms.sendMessage(options);
            res.redirect('/');
        }
    })
})

app.get('/upcomingMessageUser/:id', (req, res, next) => {
    MemberDetails.findById(req.params.id, async function (err, docs) {
        if (err) {
            res.send("Some error occured!");
            next(err);
        } else {
            var options = {authorization : process.env.API_KEY , message : 'This message is from The Rock Gym. Your next gym payment is coming within 5 days.' ,  numbers : [docs.mobile]};
            await fast2sms.sendMessage(options);
            res.redirect('/');
        }
    })
})


app.get('/deleteData/:id', (req, res, next) => {

    MemberDetails.findByIdAndDelete(req.params.id, function (err, docs) {
        if (err) {
            res.send("Some error occured!");
            next(err);
        }
        else {
            res.redirect('/');
        }
    })
})


app.post('/getdata', async (req, res, next) => {
    console.log(req.body);
    if (req.body.admission != "" && req.body.name != "" && req.body.address != "" &&
        req.body.rollno != "" && req.body.mobile != "" && req.body.locker != "" &&
        req.body.timing != "") {
        const Member = new MemberDetails({
            name: req.body.name,
            address: req.body.address,
            rollno: req.body.rollno,
            admission: req.body.admission,
            mobile: req.body.mobile,
            locker: req.body.locker,
            package: req.body.package,
            timing: req.body.timing,
            image : {
                data: req.body.image,
                contentType: 'image/png'
            },
        })


        const result = await Member.save();

        res.redirect('/');
    }
    else{
        res.send('value cannot be null!');
    }
});

app.listen(8000, () => {
    console.log(`listening to port number 8000`);
});




// SCHEMA 

const memberDetailSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    rollno: {
        type: Number,
    },
    admission: {
        type: Date,
    },
    mobile: {
        type: Number,
    },
    package: String,
    locker: {
        type: Number,
    },
    timing: {
        type: String,
    },
    image:{
        data: Buffer,
        contentType: String,
    }
})

//s MODEL 

const MemberDetails = new mongoose.model("Member", memberDetailSchema);