//jshint esversion:6
// Require both packages installed in hyper(express, body-parser)

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
//Require mongoose
const mongoose = require("mongoose");
//Require Lodash
const _ = require("lodash");

// Create an app const by using express
const app = express();


// Tells our app which is generated using express to use EJS as its view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

// This lets you use the static folder which houses your styles.css file
app.use(express.static("public"));


// Opens Connection to the mongodb server and at that shit at the end,
//to ward off the deprecation warning
mongoose.connect("mongodb+srv://admin-adam:Thegoat1@cluster0.lrtx9.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//Connect a Schema with mongoose
const itemsSchema = new mongoose.Schema({
  name: String
});
// Create a new model based on the above Schema, const is usually Capatilized
const Item = mongoose.model("Item", itemsSchema);

// Create a new doc using mongoose model
const item1 = new Item({
  name: "Welcome to your to do list"
});
// Create new doc using mongoose model
const item2 = new Item({
  name: "Press the + button to add new items"
});
// Create a new doc using mongoose model
const item3 = new Item({
  name: "Press here to delete an item"
});

// Place the above 3 docs into an array
const defaultItems = [item1, item2, item3];

// Creates a new document for our customList
// Takes two fields: First is the name of the list
// Second is an array of the list items/documents,
//associated with the list
const listSchema= {
  name: String,
  items: [itemsSchema]
}

// Creates a new mongoose model for the listSchema above
const List= mongoose.model("List", listSchema);

// When we first load up our home page, we go through this first
// Create get route that sends browser to home route
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      //Use insertMany to insert all above items(the defaultItems array) in one go
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfylly saved items");
        }
      });
      res.redirect("/");
    } else {
      // Create a response by rndering a file called list,
      //this has to exist inside a "views" folder
      // In the list file were passing in vars called "listTitle, newListItem"
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

// An Express Route Paramater for creating custom lists
app.get("/:customList", function(req,res){
  const customList= _.capitalize(req.params.customList);



List.findOne({name: customList}, function(err, foundList){

  if(!err){
    if(!foundList){
      //Create a new List
      // Create new list documents based of the List mongoose model
      const list= new List({
        name: customList,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customList);
    } else{
      //Show existing list;
      res.render("list",{
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }
  }
});

});


// Use the Post () to create a new list
app.post("/", function(req, res) {
//Create a new Item, this is linked to the input name
const itemName= req.body.newItem;
//This is linked to the button name
const listName= req.body.list;
 const item= new Item({
  name: itemName
});

if(listName ==="Today"){
  // Save Item to database
  item.save();
  // Redirect to home route
  res.redirect("/");

} else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

// A post method that will delete checked items
app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  // Check the value of the listName
  const listName= req.body.listName;

// This if statements checks to see if we are making a post request
//to delete an item from the default list where the listName is today

if(listName=== "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Item Deleted");
      res.redirect("/");
    }
  });
  //or if were deleting from the custom list
}  else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});



//Proivde another route for the work/ url
// listTitle is the title that will display on the page
// newListItem is the new input item from the user
app.get("/about", function(req, res) {
  res.render("about");
});

// Heroku server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
