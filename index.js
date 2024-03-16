const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Step 2: Database Configuration
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'touseeq123',
  database: 'blog',
});

// Step 3: Define Sequelize Model
const BlogPost = sequelize.define('BlogPost', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING, // Store the path to the image file
    allowNull: true // Allow posts without images
  }
});

sequelize.sync({ alter: false }).then(() => {
  console.log('Table Created Successfully');
});

// Step 4: Set Up Express Routes
// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Handle image upload
app.post('/posts', upload.single('imageUrl'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a new blog post
    const newBlog = await BlogPost.create({ title, content, author, imageUrl });

    // Return the created blog post
    res.status(201).json({ success: true, post: newBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Step 5: Start the Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/posts', async (req, res) => {
  try {
    const blogs = await BlogPost.findAll();
    return res.json(blogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

