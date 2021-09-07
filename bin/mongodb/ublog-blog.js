db.ublog_post.dropIndexes();
db.ublog_post.createIndex(
  {
    blog: 1,
    'live.at': -1,
  },
  {
    partialFilterExpression: { live: true },
    name: 'liveByBlog',
  }
);
db.ublog_post.createIndex(
  {
    blog: 1,
    'created.at': -1,
  },
  {
    partialFilterExpression: { live: false },
    name: 'draftByBlog',
  }
);
db.ublog_post.createIndex(
  {
    rank: -1,
  },
  {
    partialFilterExpression: { live: true },
    name: 'liveByRank',
  }
);

db.ublog_post.find({ blog: { $exists: false } }).forEach(p => {
  blogId = `user:${p.user}`;
  blog = db.ublog_blog.findOne({ _id: blogId });
  if (!blog) {
    blog = {
      _id: blogId,
      tier: NumberInt(2),
    };
    db.ublog_blog.insert(blog);
  }
  db.ublog_post.updateOne(
    { _id: p._id },
    {
      $set: {
        blog: blogId,
        created: {
          by: p.user,
          at: p.createdAt,
        },
        updated:
          p.createdAt != p.updatedAt
            ? {
                by: p.user,
                at: p.updatedAt,
              }
            : undefined,
        lived: p.liveAt
          ? {
              by: p.user,
              at: p.liveAt,
            }
          : undefined,
      },
      $unset: {
        user: 1,
        createdAt: 1,
        updatedAt: 1,
        liveAt: 1,
        troll: 1,
      },
    }
  );
});