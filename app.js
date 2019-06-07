var express          = require("express"),
    bodyParser       = require("body-parser"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    app              = express();
    
// App Config
mongoose.connect("mongodb://localhost/blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose/Model Config
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    content: String,
    created_at: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTful Routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});   
        }
    });
});

// NEW Route
app.get("/blogs/new", function(req, res) {
   res.render("new"); 
});

// CREATE Route
app.post("/blogs", function(req, res) {
   // Sanitizing - (Removing script tags)
   req.body.blog.content = req.sanitize(req.body.blog.content);
   // Create a new post
   Blog.create(req.body.blog, function(err, newPost){
      if(err){
          console.log(err);
      } else {
          // Redirect to the index page
          res.redirect("/blogs");
      }
   });
});

// SHOW Route
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundPost){
       if(err){
           console.log(err);
       } else {
           res.render("show", {post: foundPost});
       }
   }); 
});

// EDIT Route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            res.render("edit", {blog: foundPost}); 
        }
    });
});

// UPDATE Route
app.put("/blogs/:id", function(req, res){
    // Sanitizing - (Removing script tags)
    req.body.blog.content = req.sanitize(req.body.blog.content);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedPost){
        if(err){
            console.log(err);
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE Route
app.delete("/blogs/:id", function(req, res){
    // Delete Post
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            // Redirect somewhere
            res.redirect("/");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog is running...");
});

