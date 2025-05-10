class User {
    constructor(db) {
      this.db = db;
    }
  
    async findByEmail(email) {
      const [rows] = await this.db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    }

    async findById(id){
      const [rows] = await this.db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    }

    async getRating(userId) {
      const [rows] = await this.db.execute(
        'SELECT COUNT(rating) as total_ratings, SUM(rating) as sum_ratings FROM user_ratings WHERE user_id = ?',
        [userId]
      );
      
      const { total_ratings, sum_ratings } = rows[0];
      
      // Calcular a média (evitar divisão por zero)
      const averageRating = total_ratings > 0 ? Math.max(1, Math.min(5, Math.round(sum_ratings / total_ratings))) : 0;
      
      return {
        total_ratings,
        average_rating: averageRating
      };
    }
  
    async create(userData) {
      const { name, email, password, profilePicture } = userData;
      
      // Verifique se o email já existe
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    
      const [result] = await this.db.execute(
        'INSERT INTO users (name, email, password, profile_picture) VALUES (?, ?, ?, ?)',
        [name, email, password, profilePicture]
      );
      
      return { 
        id: result.insertId, 
        name, 
        email,
        profilePicture
      };
    }

    async addRating(tradeid, user_id, rating){
      const [rows] = await this.db.execute(
        'INSERT INTO user_ratings (user_id, trade_id, rating) VALUES (?, ?, ?)',
        [user_id, tradeid, rating]
      );
      return rows;
    }
  }
  
  module.exports = User;