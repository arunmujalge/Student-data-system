const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
// mongodb+srv://arun123:Arun@123456@cluster0.l9pup.mongodb.net/schoolDB
mongoose.connect('mongodb+srv://arun123:Arun@123456@cluster0.l9pup.mongodb.net/schoolDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const marksSchema = {
  marks: String,
  attendence: String,
  percentage: String
}
const Mark = mongoose.model("Mark", marksSchema);

const defMark = new Mark({marks: "",attendence: "",percentage: ""});

const termSchema = {
  term: String,
  marks: marksSchema
}
const Term = mongoose.model("Term", termSchema);

const defTerm1 = new Term({term : "term1",marks : defMark});
const defTerm2 = new Term({term : "term2",marks : defMark});

const idSchema = {
  id: String,
  password: String
}

const Id = mongoose.model("Id", idSchema);



const memberSchema = {
  name: String,
  term: [termSchema]
}
const Member = mongoose.model("Member", memberSchema);


const listSchema = {
  name: String,
  members: [memberSchema]
}

const List = mongoose.model("List", listSchema);

const c1 =new List({
  name : "class3",
})
const c2 =new List({
  name : "class4",
})
const c3 =new List({
  name : "class5",
})


var log = false;

// 8888888888888888888888888888888888888888888888888888   CLASSES  88888888888888888888888888888888888888888888888888


app.get("/classes/:customName", function(req, res) {
  const customName = req.params.customName;

  List.findOne({
    name: customName
  }, function(err, foundList) {
    if (!err) {
      res.render("classes/class", {
        class1: customName,
        newListItems: foundList.members
      });
    } else {
      console.log("sucess");
    }
  });

})

// 88888888888888888888888888888888888888888888888888888    ADD MEMBERS    8888888888888888888888888888888888888888888888888888888
// **********get class members*****************
app.get("/classMembers/:customName", function(req, res) {
  const customName = req.params.customName;
  List.findOne({
    name: customName
  }, function(err, foundList) {
    if (!err) {
      res.render("classMembers/list", {
        listTitle: customName,
        newListItems: foundList.members
      });
    } else {
      console.log("sucess");
    }
  });

})
// **********POST ADD MEMBER*****************
app.post("/addMember", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const member = new Member({
    name: itemName,
    term: [defTerm1,defTerm2]
  });
  List.findOne({
    name: listName
  }, function(err, foundList) {

    foundList.members.push(member);
    foundList.save();
    res.redirect("/classMembers/" + listName);
  });

});



// 88888888888888888888888888888888888888888888888888888     ADD MARKS   8888888888888888888888888888888888888888888888888888888888

// **********get add marks*****************
app.get("/marks/:customClass/:customTerm", function(req, res) {
  const customClass = req.params.customClass;
  const customTerm = req.params.customTerm;

  List.findOne({
    name: customClass
  }, function(err, foundList) {
    if (!err) {
      res.render("marks/marks", {
        class2: customClass,
        listTitle: customTerm,
        newListItems: foundList.members
      });
    } else {
      console.log("sucess");
    }
  });
})
// **********post add marks*****************
app.post("/marks/:customClass/:customTerm/:customName", function(req, res) {
  const customClass = req.params.customClass;
  const customTerm = req.params.customTerm;
  const customName = req.params.customName;
  var marks = req.body.marks;
  var attendence = req.body.attendence;
  var percentage = req.body.percentage;
  const mark1 = new Mark({
    marks: marks,
    attendence: attendence,
    percentage: percentage
  });

  const term1 = new Term({
    term: customTerm,
    marks: mark1
  });


  List.findOne({
    name: customClass
  }, function(err, foundList) {
    if (!err) {
      foundList.members.forEach(function(item) {
        if (item.name === customName) {
          var i = 0;
          if (item.term.length === 0) {
            item.term.push(term1);
            foundList.save();
          } else {
            item.term.forEach(function(item2) {
              if (item2.term === customTerm && i === 0) {
                if(marks === ""){
                  marks =item2.marks.marks;
                };
                if(attendence === ""){
                  attendence =item2.marks.attendence;
                };
                if(percentage === ""){
                  percentage =item2.marks.percentage;
                };
                item2.marks  = {
                  marks: marks,
                  attendence: attendence,
                  percentage: percentage
                };
                foundList.save();
              } else if (i === 0 && item.term.length === 1) {
                i = 1;
                item.term.push(term1);
                foundList.save();
              }
            })
          }
        }
      });

    } else {
      console.log("sucess");
    }
  });
    res.redirect("/marks/"+customClass+"/"+customTerm);
})

// 8888888888888888888888888888888888888888888  SEE RESULT 88888888888888888888888888888888888888888888888888888888888888

app.get("/result/:customClass/:customTerm", function(req, res) {
  const customClass = req.params.customClass;
  const customTerm = req.params.customTerm;
  var i;
  if(customTerm === "term1"){
    i=0;
  }
  if(customTerm === "term2"){
    i=1;
  }

  List.findOne({
    name: customClass
  }, function(err, foundList) {
    if (!err) {
      res.render("result/result", {
        class2: customClass,
        listTitle: customTerm,
        newListItems: foundList.members,
        i : i
      });
    } else {
      console.log("sucess");
    }
  });
})

// 888888888888888888888888888888888888888888888  LOGIN PAGE   8888888888888888888888888888888888888888888888888

// *************GET********************
app.get("/", function(req, res) {
  res.render("login");
})

app.get("/home", function(req, res) {
  if (log === true) {
    res.render("home");
  } else {
    res.render("login");
  }
})
// *************POST********************
app.post("/", function(req, res) {
  const login = req.body.login;
  const password = req.body.password;
  Id.findOne({
    id: login
  }, function(err, foundList) {
    if (!err) {
      if (foundList !== null) {
        if (foundList.password === password) {
          log = true;
          res.redirect("/home");
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/');
      }
    } else {
      console.log(err);
    }
  })
})


//8888888888888888888888888888888888888888888888888   DELETE MEMBERS    8888888888888888888888888888888888888888888888888888888888
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  List.findOneAndUpdate({
    name: listName
  }, {
    $pull: {
      members: {
        _id: checkedItemId
      }
    }
  }, function(err, foundList) {
    if (!err) {
      res.redirect("/classMembers/" + listName);
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("app has started");
});
