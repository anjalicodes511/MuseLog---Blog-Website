const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Post = require("../models/Post");


// add comment
exports.addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    
    // Find the post
    const post = await Post.findById(postId);
    // Validation
    if (!post) {
      return res.render("postDetails",{
        title: "Post",
        post,
        user: req.user,
        error: "Post not found",
        success:"",
        cssFile: "postDetails"
      });
    }

    if(!content){
        return res.render("postDetails",{
          title: "Post",
          post,
          user: req.user,
          error: "Please add comment",
          success:"",
          cssFile: "postDetails"
        });
      }
    
    // Create a new comment
    const comment = new Comment({
      content,
      post: postId,
      author: req.user._id,
    });
    
    // Save the comment
    await comment.save();
    
    // Add the comment to the post's comments array
    post.comments.push(comment._id);
    await post.save();
    // console.log(post);
    
    // Redirect to the post details page
    res.redirect(`/posts/${postId}`);
});

// get comment form
exports.getCommentForm = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return res.render("postDetails",{
      title: "Comment",
      comment,
      user: req.user,
      error: "Comment not found",
      success:"",
      cssFile: "postDetails",
    });
  }
    res.render("editComment", {
      title: "Comment",
      comment,
      user: req.user,
      error:"",
      success:"",
      cssFile: "editComment",
    });
  });

  // Update Comemnt
  exports.updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if(!comment){
      return res.render("postDetails",{
        title: "Comment",
        comment,
        user: req.user,
        error: "Comment not found",
        success:"",
        cssFile: "postDetails",
      });
    }
    
    if(comment.author.toString() !== req.user._id.toString()){
      return res.render("postDetails",{
        title: "Comment",
        comment,
        user: req.user,
        error: "You are not authorized to update this comment",
        success:"",
        cssFile: "postDetails",
      });
    }
    comment.content = content || comment.content;
    await comment.save();
    res.redirect(`/posts/${comment.post}`);
  });

  // Delete comment
  exports.deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if(!comment){
      return res.render("postDetails",{
        title: "Comment",
        comment,
        user: req.user,
        error: "Comment not found",
        success:"",
        cssFile: "postDetails",
      });
    }
    if(comment.author.toString() !== req.user._id.toString()){
      return res.render("postDetails",{
        title: "Comment",
        comment,
        user: req.user,
        error: "You are not authorized to delete this comment",
        success:"",
        cssFile: "postDetails",
      });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/posts/${comment.post}`);
  })