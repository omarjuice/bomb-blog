const userSchema = {
    create: `CREATE TABLE users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(25) UNIQUE NOT NULL,
        pswd CHAR(60) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )`,
    drop: `DROP TABLE IF EXISTS users`

}
const profileSchema = {
    create: `CREATE TABLE profiles(
        user_id INT NOT NULL UNIQUE,
        about MEDIUMTEXT,
        last_updated TIMESTAMP,
        photo_path TEXT,
        PRIMARY KEY(user_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    drop: `DROP TABLE IF EXISTS profiles`
}
const postSchema = {
    create: `CREATE TABLE posts(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        post_content LONGTEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    drop: `DROP TABLE IF EXISTS posts`
};
const likeSchema = {
    create: `CREATE TABLE likes(
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE, 
        PRIMARY KEY(user_id, post_id)
    )`,
    drop: `DROP TABLE IF EXISTS likes`
}
const commentSchema = {
    create: `CREATE TABLE comments(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NULL,
        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    drop: `DROP TABLE IF EXISTS comments`
}
const commentLikeSchema = {
    create: `CREATE TABLE comment_likes(
        user_id INT NOT NULL,
        comment_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        PRIMARY KEY(user_id, comment_id)
    )`,
    drop: `DROP TABLE IF EXISTS comment_likes`
}
const replySchema = {
    create: `CREATE TABLE replies(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        comment_id INT NOT NULL,
        reply_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )`,
    drop: `DROP TABLE IF EXISTS replies`
}
const tagSchema = {
    create: `CREATE TABLE tags(
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(60) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
    )`,
    drop: `DROP TABLE IF EXISTS tags`
}
const postTagSchema = {
    create: `CREATE TABLE post_tags(
        post_id INT NOT NULL,
        tag_id INT NOT NULL,
        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY(post_id, tag_id)
    )`,
    drop: `DROP TABLE IF EXISTS post_tags`
}
const commentTagSchema = {
    create: `CREATE TABLE comment_tags(
        comment_id INT NOT NULL,
        tag_id INT NOT NULL,
        FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY(comment_id, tag_id)
    )`,
    drop: `DROP TABLE IF EXISTS comment_tags`
}
const followSchema = {
    create: `CREATE TABLE follows(
        followee_id INT NOT NULL,
        follower_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY(followee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY(followee_id, follower_id)
    )`,
    drop: `DROP TABLE IF EXISTS follows`
}
const interestSchema = {
    create: `CREATE TABLE interests(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        interest_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )`,
    drop: `DROP TABLE IF EXISTS interests`
}
const userInterestSchema = {
    create: `CREATE TABLE user_interests(
        user_id INT NOT NULL,
        interest_id INT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(interest_id) REFERENCES interests(id) ON DELETE CASCADE,
        PRIMARY KEY (interest_id, user_id)
    )`,
    drop: `DROP TABLE IF EXISTS user_interests`
}
module.exports = {
    userSchema, profileSchema, postSchema, likeSchema, commentSchema, interestSchema, userInterestSchema,
    commentLikeSchema, replySchema, tagSchema, postTagSchema, commentTagSchema, followSchema
}