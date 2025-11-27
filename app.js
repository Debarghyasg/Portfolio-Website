const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);




main().then(()=>{
  console.log('Connected to MongoDB');})

.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get('/', (req, res) => {
    res.send('Hello World!');
});
//index route
app.get("/listings", async (req, res) => {
    const allListings=await Listing.find({});
    res.render("index.ejs",{allListings});
    });

//new route
app.get("/listings/new",(req,res)=>{
    res.render("new.ejs");
});


//Show route
app.get("/listings/:id",async(req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findById(id);
   res.render("show.ejs",{listing});

});

//create route
app.post('/listings',async(req,res)=>{
    // let{title,description,imageUrl,price,location,country}=req.body;
    // let newListing=new Listing({title,description,imageUrl,price,location,country});
    // await newListing.save();
    // res.redirect('/listings');});
    let newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');});

//Edit route
app.get('/listings/:id/edit',async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   res.render("edit.ejs",{listing});
});
//update
app.put('/listings/:id',async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/{$id}`);});

app.delete('/listings/:id',async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:",deletedListing);
    res.redirect('/listings');});

    
    
    



// app.get('/testlistings', async (req, res) => {
//     let sampleListings=new Listing({
//         title: "New villa",
//         description: "Buy beach",
//         price: 250,
//         location: "California",
//         country: "USA"});
//         await sampleListings.save();
//         console.log("Sample listing saved:");
//         res.send('Sample listing created and saved to database.');
        
    
//     });














































app.listen(3000, () => {
    console.log('Server is running on port 3000');
});