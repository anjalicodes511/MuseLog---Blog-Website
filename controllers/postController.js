const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");

// Rendering post form
exports.getPostForm = asyncHandler((req, res) => {
  res.render("newPost", {
    title: "Create Post",
    user: req.user,
    error:"",
    success:"",
    cssFile: "newPost"
  });
});

// Creating new post
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  // validation
  if (!req.files || req.files.length === 0) {
    return res.render("newPost", {
      title: "Create Post",
      user: req.user,
      error: "Please upload at least one image",
      success:""
    });
  }
  const images = await Promise.all(
    req.files.map(async (file) => {
      // save images into our database
      const newFile = await File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      // console.log(newFile);
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );

  // create post
  const newPost = await Post({
    title,
    content,
    author: req.user._id,
    images,
  });
  await newPost.save();
  
  res.render("newPost", {
    title: "Create Post",
    user: req.user,
    success: "Post created successfully",
    error:"",
    cssFile: "newPost"
  });
});

// Getting all posts
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("author","username");
  res.render("posts", {
    title: "Posts",
    user: req.user,
    posts,
    success:"",
    error:"",
    cssFile: "posts"
  });
});


// Get post by id
exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author","username").populate({
    path: "comments",
    populate: {
      path: "author",
      model: "User",
      select: "username"
    }
  });
  res.render("postDetails", {
    title: post.title,
    user: req.user,
    post,
    success:"",
    error:"",
    cssFile: "postDetails"
  });
});

// Get edit post form
exports.getEditPostForm = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if(!post){
    return res.render("postDetails",{
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success:"",
      cssFile: "postDetails"
    });
  }
  res.render("editPost", {
    title: "Edit Post",
    user: req.user,
    post,
    success:"",
    error:"",
    cssFile: "editPost"
  });
});

// Update Post
exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  // Find the post
  const post = await Post.findById(req.params.id);
  if(!post){
    return res.render("postDetails",{
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success:"",
      cssFile: "postDetails"
    });
  }
  // Validation

  if(post.author.toString() !== req.user._id.toString()){
    return res.render("postDetails",{
      title: "Post",
      post,
      user: req.user,
      error: "You are not authorized to update this post",
      success:"",
      cssFile: "postDetails"
    });
  }
  // Update post
post.title = title || post.title;
post.content = content || post.content;

// Only update images if new files are uploaded
if (req.files && req.files.length > 0) {
  // Delete old images from cloudinary
  await Promise.all(post.images.map(async (image) => {
    await cloudinary.uploader.destroy(image.public_id);
  }));

  // Upload and save new images
  post.images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
}

  await post.save();
 res.redirect(`/posts/${post._id}`);
});

// Delete Post
exports.deletePost = asyncHandler(async (req, res) => {
  // find the post
  const post = await Post.findById(req.params.id);
  if(!post){
    return res.render("postDetails",{
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success:"",
      cssFile: "postDetails"
    });
  }
  if(post.author.toString() !== req.user._id.toString()){
    return res.render("postDetails",{
      title: "Post",
      post,
      user: req.user,
      error: "You are not authorized to delete this post",
      success:"",
      cssFile: "postDetails"
    });
  }
  await Promise.all(post.images.map(async (image) => {
    await cloudinary.uploader.destroy(image.public_id);
  }));
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});