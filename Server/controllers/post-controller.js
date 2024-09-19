import Post from '../models/post.js';
import User from '../models/user.js';

export const createPost = async (req, res) => {
    try {
        const { text, image } = req.body;
        const post = new Post({
            user: req.user.id,
            text,
            image,
        });

        await post.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { posts: post._id } });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Error creating post' });
    }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    res.status(201).json({ comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.toggleLike(userId);

    res
      .status(200)
      .json({
        likesCount: post.likes.length,
        liked: post.likes.includes(userId),
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
