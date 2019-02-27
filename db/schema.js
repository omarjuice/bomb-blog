const userSchema = {
    create: `CREATE TABLE users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(25) UNIQUE NOT NULL,
        pswd CHAR(60) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        privilege VARCHAR(20) DEFAULT 'user',
        CHECK(privilege IN ('bot', 'user', 'admin'))
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
        last_updated TIMESTAMP,
        title VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        post_content LONGTEXT NOT NULL,
        image VARCHAR(255),
        featured BOOLEAN DEFAULT 0, 
        featured_at TIMESTAMP,
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
        last_updated TIMESTAMP,
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
        last_updated TIMESTAMP,
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
const userTagSchema = {
    create: `CREATE TABLE user_tags(
        user_id INT NOT NULL,
        tag_id INT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY(user_id, tag_id)
    )`,
    drop: `DROP TABLE IF EXISTS user_tags`
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
const userSecretSchema = {
    create: `CREATE table user_secrets(
        user_id INT NOT NULL,
        question VARCHAR(255) NOT NULL,
        answer CHAR(60) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY(user_id) 
    )`,
    drop: `DROP TABLE IF EXISTS user_secrets`
}



module.exports = {
    userSchema, profileSchema, postSchema, likeSchema, commentSchema, commentLikeSchema,
    replySchema, tagSchema, postTagSchema, commentTagSchema, followSchema, userTagSchema, userSecretSchema
}