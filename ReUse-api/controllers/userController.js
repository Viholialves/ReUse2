const UserService = require('../services/userService');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');

class UserController {
  constructor() {
    this.userService = new UserService();

  }


  async rating(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Id do usuario é obrigatório' });
      }

      const result = await this.userService.rating(id);
      //console.log(result);
      res.json({
        success: true,
        rating: result.rating.average_rating
      });
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: error.message 
      });
    }
  }
  
}


module.exports = UserController;