const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');

const userModel = new User(db);

class AuthService {
  async login(email, password) {
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Senha incorreta');
    }

    const rating = await userModel.getRating(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'asjfvjASFJfvhasvja8vfaj',
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture,
        rating: rating.average_rating
      }
    };
  }

  async register(userData) {
    const { name, email, password, profilePicture } = userData;
    
    // Verificar se o usuário já existe
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criar usuário
    const user = await userModel.create({
      name,
      email,
      password: password,
      profilePicture
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return {
      token,
      user
    };
  }
}

module.exports = AuthService;