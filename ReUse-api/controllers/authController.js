const AuthService = require('../services/authService');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');

// Criar diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
}).single('profilePicture');

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.register = this.register.bind(this);
    this.cleanupFile = this.cleanupFile.bind(this);
  }

  cleanupFile(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erro ao limpar arquivo temporário:', err);
      } else {
        console.log('Arquivo temporário removido:', filePath);
      }
    });
  }

  async validate(req, res) {
    try {
      res.json({
        success: true,
        ok: 'ok',
      });
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const result = await this.authService.login(email, password);
      
      res.json({
        success: true,
        token: result.token,
        user: result.user
      });
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: error.message 
      });
    }
  }
  
  async register(req, res) {
    let uploadedFilePath = null;
    uploadMiddleware(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({ 
            success: false,
            message: err.message 
          });
        }

        if (req.file) {
          uploadedFilePath = path.join(uploadDir, req.file.filename);
        }

        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
          if (uploadedFilePath) {
            this.cleanupFile(uploadedFilePath);
          }
          return res.status(400).json({ 
            success: false,
            message: 'Nome, email e senha são obrigatórios' 
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profilePath = req.file ? path.join('/profile-pictures', req.file.filename) : null;

        const result = await this.authService.register({
          name,
          email,
          password: hashedPassword,
          profilePicture: profilePath
        });
        
        res.status(201).json({
          success: true,
          token: result.token,
          user: result.user
        });
      } catch (error) {
        if (uploadedFilePath) {
          this.cleanupFile(uploadedFilePath);
        }

        console.error('Registration error:', error);
        res.status(500).json({ 
          success: false,
          message: error.message || 'Erro no servidor' 
        });
      }
    });
  }
}


module.exports = AuthController;