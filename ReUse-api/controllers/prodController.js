const ProdService = require('../services/prodService');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, '../uploads/product-pictures');

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
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuração do multer para múltiplos arquivos
const uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // Limite de 10 arquivos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
}).array('productPictures', 4); // Aceita até 10 imagens com o nome 'productPictures'

class ProdController {
    constructor() {
        this.prodService = new ProdService();
        this.cleanupFiles = this.cleanupFiles.bind(this);
    }

    // Método para limpar múltiplos arquivos
    cleanupFiles(filePaths) {
        filePaths.forEach(filePath => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Erro ao limpar arquivo temporário:', err);
                } else {
                    console.log('Arquivo temporário removido:', filePath);
                }
            });
        });
    }

    async list(req, res) {
        try {
            const result = await this.prodService.list();
            
            res.json({
                success: true,
                produtos: result.list,
            });
        } catch (error) {
            res.status(401).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    async prodById(req, res){
      try {
        const id = req.params.id;
        const result = await this.prodService.prod(id);

        
        res.json({
            success: true,
            produto: result.prod,
        });
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: error.message 
        });
    }
    }

    async filter(req, res) {
        try {
            const { name, city, state, min, max } = req.body;
    
            const result = await this.prodService.filter(name, city, state, min, max);
            
            res.json({
                success: true,
                prdutos: result.filter,
            });
        } catch (error) {
            res.status(401).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    async createProd(req, res) {
        let uploadedFilePaths = [];
        
        // Usamos o middleware de upload personalizado
        uploadMiddleware(req, res, async (err) => {
            try {
                if (err) {
                    return res.status(400).json({ 
                        success: false,
                        message: err.message 
                    });
                }

                // Coletar caminhos dos arquivos enviados
                if (req.files && req.files.length > 0) {
                    uploadedFilePaths = req.files.map(file => path.join(uploadDir, file.filename));
                }

                const { user_id, nome, tags, descricao, estado, valor, city, state } = req.body;

                // Validação dos campos obrigatórios
                if (!user_id || !nome || !estado || !valor || !city || !state) {
                    if (uploadedFilePaths.length > 0) {
                        this.cleanupFiles(uploadedFilePaths);
                    }
                    return res.status(400).json({ 
                        success: false,
                        message: 'Todos os campos obrigatórios devem ser preenchidos' 
                    });
                }

                // Preparar as fotos para salvar no banco (formato JSON)
                const fotos = req.files ? 
                    req.files.map(file => path.join('/product-pictures', file.filename)) : 
                    [];

                // Converter tags de string para JSON se necessário
                let parsedTags = [];
                if (tags) {
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                }

                const result = await this.prodService.create({
                    user_id,
                    fotos: JSON.stringify(fotos), // Armazenar como JSON string
                    nome,
                    tags: JSON.stringify(parsedTags), // Armazenar como JSON string
                    descricao,
                    estado,
                    valor,
                    city,
                    state
                });

                res.status(201).json({
                    success: true,
                    produto: result.create,
                });

            } catch (error) {
                if (uploadedFilePaths.length > 0) {
                    this.cleanupFiles(uploadedFilePaths);
                }

                console.error('Error in createProd:', error);
                res.status(500).json({ 
                    success: false,
                    message: error.message || 'Erro no servidor' 
                });
            }
        });
    }

    async getProdAvByUser(req, res) {
        try {

            const id = req.params.user_id;
            const result = await this.prodService.getProdAvByUser(id);

            res.json({
                success: true,
                produtos: result.rows,
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message || 'Erro no servidor' 
            });
        }

    }
}

module.exports = ProdController;