const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', true);

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://rahiblogger:rahipatel.1994@cluster0.jpdeltk.mongodb.net/todo", {
  useNewUrlParser: true
});

const todoSchema = new mongoose.Schema({
  task : String
})
const todolist = mongoose.model("todolist", todoSchema);

const listSchema = {
  name : String,
  items: [todoSchema],
}

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res){
  let day = date();
  todolist.find({},function(err, tasks){
    if(err){
      console.log(err);
    }else{

        res.render("list", {kindOfDay: "Today", tasks: tasks});

    }
  })

});


app.get("/:typeOfList", function(req, res){
    const customListName = _.capitalize(req.params.typeOfList);

    List.findOne({name:customListName},function(err, result){
      if(!err){
        if(!result){
          //create a new list in database if if not already there
          const list = new List({
            name: customListName,
            items: [{task:"dsdsf"},{task:"sfddsf"},{task:"gdsf"}]
          })
          list.save();
          res.redirect("/"+ customListName);
        }else{
          res.render("list", {kindOfDay: result.name, tasks: result.items})
        }
      }
    })


});


app.post("/", function(req, res){

      const task = new todolist({
        task: req.body.newItem
      });

      if(req.body.button === "Today"){
        task.save();
        res.redirect("/");
      }
      else{
        List.findOne({name: req.body.button}, function(err, foundList){
          foundList.items.push(task)
          foundList.save()
          res.redirect("/"+ req.body.button)
        })
      }

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox
  const listName = req.body.listName;
  if (listName === "Today"){
    todolist.deleteOne({task : checkedItem},function(err, item){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted.")
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{task: checkedItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }

})


app.listen(process.env.PORT || 3000, function(){
  console.log("server is running on 3000 port");
});
