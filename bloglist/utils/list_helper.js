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

const mostBlogs = (blogs) => {
  const authors = blogs.reduce((authors, blog) => {
    if (!authors[blog.author]) {
      authors[blog.author] = 1;
    } else {
      authors[blog.author]++;
    }
    return authors;
  }, {});
  const authorWithMostBlogs = Object.keys(authors).reduce((max, author) => authors[max] > authors[author] ? max : author, Object.keys(authors)[0]);
  return {
    title: authorWithMostBlogs,
    blogs: authors[authorWithMostBlogs]
  }
}

const mostLikes = (blogs) => {
  const authors = blogs.reduce((authors, blog) => {
    if (!authors[blog.author]) {
      authors[blog.author] = blog.likes;
    } else {
      authors[blog.author] += blog.likes;
    }
    return authors;
  }, {});
  const authorWithMostLikes = Object.keys(authors).reduce((max, author) => authors[max] > authors[author] ? max : author, Object.keys(authors)[0]);
  return {
    title: authorWithMostLikes,
    likes: authors[authorWithMostLikes]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
