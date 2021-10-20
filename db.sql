CREATE TABLE users(
    user_id UUID DEFAULT uuid_generate_v4()  PRIMARY KEY,
    user_name VARCHAR(32) NOT NULL,
    user_email VARCHAR UNIQUE NOT NULL,
    user_password VARCHAR(100) NOT NULL
);

CREATE TABLE user_sessions(
    session_id UUID DEFAULT uuid_generate_v4()  PRIMARY KEY,
    session_user_agent VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(user_id)
    socket_id VARCHAR 
);

CREATE TABLE categories (
    category_id UUID DEFAULT uuid_generate_v4()  PRIMARY KEY,
    category_name VARCHAR NOT NULL,
    category_photo  NOT NULL
);

CREATE TABLE user_ads(
    ads_id UUID DEFAULT uuid_generate_v4()  PRIMARY KEY,
    user_ads_title VARCHAR NOT NULL,
    user_ads_price VARCHAR NOT NULL,
    user_ads_phone VARCHAR NOT NULL,
    user_ads_description VARCHAR NOT NULL,
    user_ads_photos VARCHAR ARRAY NOT NULL,
    user_ads_slug VARCHAR NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(category_id),
    user_id UUID NOT NULL REFERENCES users(user_id)
);

CREATE TABLE messages (
    message_id UUID DEFAULT uuid_generate_v4()  PRIMARY KEY,
    message_text VARCHAR NOT NULL,
    user_id UUID NOT NULL REFERENCES users(user_id),
    reciver_id UUID NOT NULL REFERENCES users(user_id)
);