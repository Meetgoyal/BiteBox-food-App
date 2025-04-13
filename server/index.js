const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const restaurantRoutes = require('./Routes/restaurantRoutes');
dotenv.config();
const app = express();
const customerRoutes = require('./Routes/customerRoutes');
const userRoutes = require('./Routes/userRoutes');
const PORT = 5000;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PULL,DELETE",
    credentials: true
}))
app.use(express.urlencoded());
app.listen(PORT,()=>{
    console.log("server connected");
});
mongoose.connect('mongodb+srv://meetashgoyal:3nKV6JOmuRFkFeoH@cluster0.og6ex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log("DBMS connected");
})
.catch((error)=>{
    console.log(error);
})

app.use('/api/customer',customerRoutes);
app.use('/api/user',userRoutes);
app.use('/api/restaurant',restaurantRoutes);

