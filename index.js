const express = require('express');
const app = express();
const product = require('./api/product');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use("./api/product", product);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.li11u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const doctorCollection = client.db("doctor-meet-appointment").collection("doctors");
        const appointmentCollection = client.db("doctor-meet-appointment").collection("allAppointments");

        app.get("/doctors",async(req,res)=>{
            const doctors = await doctorCollection.find({}).toArray();
            res.json(doctors);
        })
        app.get("/allAppointments",async(req,res)=>{
            const appointments = await appointmentCollection.find({}).toArray();
            res.json(appointments);
        })
        app.get("/allAppointments/single", async (req, res) => {
            const query={ patientEmail: req.query.patientEmail };
            const appointmentPerUser = await appointmentCollection.find(query).toArray();
            res.json(appointmentPerUser);
        })
    
        app.get("/allAppointments/:id", async (req, res) => {
            const id=req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await appointmentCollection.findOne(query);
            res.json(result);
        })
        app.post("/allAppointments", async (req, res) => {

            const appointment = await appointmentCollection.insertOne(req.body);
            res.json(appointment);
        })
        app.put("/allAppointments/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: "paid" } };
            const options = { upsert: false };
            const updatedStatus = await appointmentCollection.updateOne(query, updateDoc, options);
            res.json(updatedStatus);
        })
        app.delete("/allAppointments/:id",async(req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result=await appointmentCollection.deleteOne(query);
            res.json(result)
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get("/", (req, res) => {

    res.json("Backend is working");
})
app.listen(port, () => {
    console.log("Listening to port ", port);
})