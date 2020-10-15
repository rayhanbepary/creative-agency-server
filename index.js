const express       = require('express');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const fileUpload    = require('express-fileupload');
const MongoClient   = require('mongodb').MongoClient;
const ObjectId      = require('mongodb').ObjectId;

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jsjow.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    const servicesCollection        = client.db("creativeAgency").collection("services");
    const orderedServicesCollection = client.db("creativeAgency").collection("orderedService");
    const reviewCollection          = client.db("creativeAgency").collection("clientsReview");
    const adminCollection           = client.db("creativeAgency").collection("agencyAdmin");
    const contactCollection         = client.db("creativeAgency").collection("contactMessage");

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        servicesCollection.insertOne({ title, description, status, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post("/orderedService", (req, res) => {

        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const service = req.body.service;
        const projectDetail = req.body.projectDetail;
        const price = req.body.price;
        const orderStatus = req.body.orderStatus;
        const description = req.body.description;
        const serviceIcon = req.body.serviceIcon;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderedServicesCollection.insertOne({ name, email, service, projectDetail, price, orderStatus, description, serviceIcon, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/getOrderedService', (req, res) => {
        const queryEmail = req.query.email;
        orderedServicesCollection.find({email: queryEmail})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/getAllOrderedService', (req, res) => {
        orderedServicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    
    app.patch("/updateService/:id", (req, res) => {
        orderedServicesCollection.updateOne({_id: ObjectId(req.params.id)},{
            $set: {orderStatus: req.body.orderStatus}
        })
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })

    app.post("/makeAdmin", (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
        .then( result => {
            res.send( result.insertedCount > 0 );
        })
    });

    app.post("/isAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.find({email: email})
        .toArray((err, admin) => {
            res.send(admin.length > 0);
        })
    })

    app.post("/clientsReview", (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
        .then( result => {
            res.send( result.insertedCount > 0 );
        })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.post("/contactUs", (req, res) => {
        const contactMessage = req.body;
        contactCollection.insertOne(contactMessage)
        .then( result => {
            res.send( result.insertedCount > 0 );
        })
    });

});

app.get('/', (req, res) => {
    res.send("Creative agency working")
})

app.listen( process.env.PORT || port );