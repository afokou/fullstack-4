const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
}

const favoriteBlog = (blogs) => {
  const favoriteBlog = blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0]);
  if (!favoriteBlog) {
    return {};
  }
  return {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: favoriteBlog.likes
  };
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
