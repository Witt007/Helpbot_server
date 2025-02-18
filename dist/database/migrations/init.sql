CREATE TABLE IF NOT EXISTS wx_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    open_id VARCHAR(100) NOT NULL UNIQUE,
    union_id VARCHAR(100),
    session_key VARCHAR(100),
    nick_name VARCHAR(100),
    avatar_url TEXT,
    sex             enum ('0','1'),
    phone           varchar(20),
    last_login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    open_id VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (open_id) REFERENCES wx_users(open_id)
);

CREATE TABLE IF NOT EXISTS messages (
                                        sort_index BIGINT AUTO_INCREMENT,
                                        id         VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    status ENUM('sending', 'sent', 'failed') NOT NULL,
                                        content    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        FOREIGN KEY (conversation_id) REFERENCES chat_sessions (id),
                                        UNIQUE KEY (sort_index)
); 