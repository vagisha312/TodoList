const express=require("express");
const bodyparser=require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine' , 'ejs');


mongoose.connect("mongodb+srv://guptavagisha312:Gate%402026@todolist.mta1xlt.mongodb.net/", {useNewUrlParser: true});
//mongoose.connect("mongodb://127.0.0.1:27017/ItemsDB", {useNewUrlParser: true});

const itemsSchema = {
    name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Study"
});

const item2 = new Item({
    name:"Play"
});

const item3 = new Item({
    name:"Sleep"
});

const listSchema = {
    name:String,
    items:[itemsSchema]
};
const defaultItems = [item1,item2,item3]

const List = mongoose.model("List",listSchema);



//const defaultItems = [item1,item2,item3];

/*Item.insertMany([item1, item2, item3]) 
    .then(function(){
        console.log("Successfully saved ");
    })
    .catch(function(err){
        console.log(err);
   });

   app.get("/", function(req, res) {
    Item.find().then(function (myItems){

       


      res.render("list", {listTitle: "Today", newListItems: myItems});
    });
  }); */


 
 
app.get("/", async function(req, res) {
 
  var foundItems = await Item.find()
 
  if(foundItems.length === 0){
  Item.insertMany(defaultItems)
  .then(function () {
    console.log("Successfully saved default items to DB")
  })
  .catch(function (err) {
    console.log(err)
  })
  res.redirect("/")
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
 
 
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
   
    List.findOne({name:customListName})
      .then(function(foundList){
          
            if(!foundList){
              const list = new List({
                name:customListName,
                items:defaultItems
              });
            
              list.save();
              console.log("saved");
              res.redirect("/"+customListName);
            }
            else{
              res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
            }
      })
      .catch(function(err){});
   
   
    
    
  })

/*app.get("/:customListName",function(req,res){
    const customListName= req.params.customListName;
    const list=new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
  }); */

/*app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  }); */

  app.post("/delete", function(req, res){
 
    const checkedItemId = req.body.checkbox.trim();
    const listName = req.body.listName;
   
    if(listName === "Today") {
   
      Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
   
      res.redirect("/");
   
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
        {
          res.redirect("/" + listName);
        });
    }
   
  });


  app.post("/", async (req, res) => {
    let itemName = req.body.newItem
    let listName = req.body.list
 
    const item = new Item({
        name: itemName,
    })
 
    if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {
 
        await List.findOne({ name: listName }).exec().then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        }).catch(err => {
            console.log(err);
        });
    }
})


/*app.post("/", function(req, res)
{
    const itemName = req.body.newItem;
        name:itemName
    });
    item.save();
    res.redirect("/");
});*/

// app.get("/work",function(req,res)
// {
//   res.render("list", {ListTitle:"Work List",newListItems:workItems });
// });







app.listen(3000,function()
{
    console.log("server is played on port 3000");
});