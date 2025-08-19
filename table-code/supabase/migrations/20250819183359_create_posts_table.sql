CREATE TABLE posts (
                       id BIGSERIAL PRIMARY KEY,
                       title TEXT NOT NULL,
                       content TEXT,
                       created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on posts" ON posts FOR ALL USING (true);