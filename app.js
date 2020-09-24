require('dotenv').config();
const express= require("express");
const bodyParser= require("body-parser");
const ejs=require("ejs");
//const alert=require("alert");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate=require("mongoose-findorcreate");
//const popupS = require('popups');
// var flash = require('req-flash');


const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded(
  {extended:true}
  ));
app.use(session({
  secret: process.env.SECRET,//"my own e-commerce website",
  resave:false,
  saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());

app.use(express.static("public"));

mongoose.connect("mongodb+srv://asperger:asperger@cluster0.irwcc.mongodb.net/ecomDB", {useNewUrlParser: true, useUnifiedTopology: true });
/////////////schemas/////////////////////////////////////////////////////////////////////////////////////////////////

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  googleId:String
});
const brandSchema=new mongoose.Schema({
  _id:String,
  bname: [String]
});
const productSchema=new mongoose.Schema({
    brand : String,
    stuff : String,
    pname : String,
    ram : String,
    rom : String,
    battery : String,
    displaysize : String,
    rearcamera : String,
    frontcamera : String,
    color : String

});
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: {
      type: [productSchema]
    },
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
   { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: {
      type: [{
        pname : String,
        stuff: String,
        brand: String,
        quantity:Number,
        firstName:{ type: String, required:[false,"please provide required details?"]},
        lastName:{ type: String, required: [false,"please provide required details?"]},
        mobileNo:{ type: String, required: [false,"please provide required details?"]},
        address:{ type: String, required: [false,"please provide required details?"]},
        orderedOn: {
          type: Date,
          default: Date.now
        }
      }]
    },
  },
  //  { timestamps: true }
);

// module.exports = mongoose.model("Cart", CartSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//////////////////////////////////////////////////models//////////////////////////////////////////////////////////////////////
const User=new mongoose.model("User",userSchema);
const Brand=new mongoose.model("Brand",brandSchema);
const Product=new mongoose.model("Product",productSchema);
const Cart=new mongoose.model("Cart",cartSchema);
const Order=new mongoose.model("Order",orderSchema);



passport.use(User.createStrategy());//to authenticate user

passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id,function(err,user){
    done(err,user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home2",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
  res.render("home3");
});

app.get("/auth/google",
passport.authenticate("google",{scope:["profile"],prompt : "select_account"})
);

app.get("/auth/google/home2",//redirect url after successful authentication by google
passport.authenticate("google",{failureRedirect:"/login"}),//locally authenticating
function(req,res){
  //successful authentification
  res.redirect("/home2");
});

app.get("/home2",function(req,res){
   if(req.isAuthenticated()){
     res.render("home2");
   }else{
     res.redirect("/login");
   }
});
app.get("/signup",function(req,res){
  res.sendFile(__dirname+"/signup.html");
});

app.get("/login",function(req,res){
  res.render("login");
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

///////////////////////////////brands get rout//////////////////////////////
app.get("/home2/:brands",function(req,res){
  const requestedId=req.params.brands;
  Brand.findOne({_id:requestedId},function(err,allbrands){
     //   console.log(requestedId);
     // console.log(allbrands);
    res.render("brands",{allBrands:allbrands});
  });
});
/////////////////////////////specific brand's items get rout/////////////////
app.get("/brand/:specificProducts",function(req,res){
 const requestedProducts=req.params.specificProducts;
 Product.find({brand:requestedProducts},function(err,allproducts){
  // console.log(allproducts);
   res.render("products",{allProducts:allproducts,user:req.user.username});
 });
});
///////////////////////////////////////cart rout/////////////////////////////

app.get("/cart/loadcart",function(req,res){
  if(req.isAuthenticated()){
    const userId=req.user._id;
    Cart.findOne({ userId:userId},function(err,foundcart){
      if(foundcart&&foundcart.products.length>0){
      res.render("cart",{cart:foundcart});
    }else{
        res.render("emptycart");
      }
      });

  }else{
    res.redirect("/login");
  }
});

app.post("/cart",function(req,res){
  const pname=req.body.cartbtn;
   var product;
  Product.findOne({pname:pname},function(err,found){
    if(found){
     product=found;
    }
  });
  if(req.isAuthenticated()){
  const userId= req.user._id;
  Cart.findOne({ userId:userId},function(err,foundcart){
    if(foundcart){
      let itemIndex = foundcart.products.findIndex(function(p){
        return p.pname==product.pname;
      });
      if(itemIndex<0){
        foundcart.products.push(product);
        foundcart.save();
      }
      //  res.render("cart",{cart:foundcart});
      res.redirect("/cart/loadcart");
    }
    else{
      const newCart=new Cart({
        userId,
        products: [product]
     });
     newCart.save();
    //  res.render("cart",{cart:newCart});
    res.redirect("/cart/loadcart");
   }
  });
}
  else{
    res.redirect("/login");
  }
});

app.post("/removecart",function(req,res){
  const pname=req.body.removebtn;
  //console.log(pname);
  if(req.isAuthenticated()){
  const userId= req.user._id;
  var itemIndex;
  Cart.findOne({ userId:userId},function(err,foundcart){
    if(foundcart){
     // console.log(foundcart);
     itemIndex = foundcart.products.findIndex(function(p){
      return p.pname==pname;
    });
    //console.log(foundcart.products[itemIndex]);
    foundcart.products.splice(itemIndex,1);
    foundcart.save();
    //console.log(itemIndex);
    res.redirect("/cart/loadcart");
    }
  });
}else{
  res.redirect("/login");
}
});


/////////////////////////////////////////buy rout////////////////////////////
app.post("/order",function(req,res){
  const pname=req.body.buybtn;
  res.render("orderdata",{orderfor:pname});
});

app.post("/order/confirmed",function(req,res){
  if(req.isAuthenticated()){

  const pname=req.body.confirmbuybtn;
  const firstName=req.body.firstname;
  const lastName=req.body.lastname;
  const mobileNo=req.body.address;
  const address=req.body.address;
  const quantity=req.body.quantity;
  var product;
  const userId= req.user._id;
   Product.findOne({pname:pname},function(err,found){
     if(!err){
        product=found;
        const stuff=product.stuff;
        const brand=product.brand;
        //console.log(product);
         Order.findOne({ userId:userId},function(err,foundorder){
         if(foundorder){
             foundorder.products.push({pname,stuff,brand,quantity,firstName,lastName,mobileNo,address});
             foundorder.save();
         }else{
          const newOrder=new Order({
                    userId,
                    products: [{pname,stuff,brand,quantity,firstName,lastName,mobileNo,address}]
                 });
                 //newOrder.products[0].quantity=req.body.quantity;
                 newOrder.save();
                }

           res.render("orderplacedgreeting");
        });
    }
   });
 }else{
   res.redirect("/login");
 }
  });
  //////////////load orders//////////////////////////////////////////
  app.get("/load/loadOrders",function(req,res){
   if(req.isAuthenticated()){
      Order.findOne({userId:req.user._id},function(err,found){
        if(found&&found.products.length>0){
          var product=found.products;
          //console.log(found);
          //console.log(product[1]);
          res.render("allorders",{allProducts:product});
        }else{
          res.render("emptycart");
        }
      });
   }else{
     res.redirect("/login");
   }
  });
  ////////////cancelorder////////////////////////////
  app.post("/order/cancelorder",function(req,res){

    const orderId=req.body.cancelbtn;
    Order.findOne({userId:req.user._id},function(err,found){
       if(found){
        const product=found.products;
        const orderIndex = product.findIndex(function(p){
          return p._id==orderId;
        });
        product.splice(orderIndex,1);
        found.save();
       }
    });
    res.redirect("/load/loadOrders");
  });


app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/home2");
      });
    }
  });

});

app.post("/signup",function(req,res){
  // if(validatePassword(req.body.password)){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/signup");
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/home2");
      })
    }
  });
});


app.listen(process.env.PORT || 3000,function(){
  console.log("server running on port 3000.");
});
