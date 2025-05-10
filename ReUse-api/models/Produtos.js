class Prod {
    constructor(db) {
      this.db = db;
    }

    async getProductsAvalible() {
        const [rows] = await this.db.execute(
          'SELECT * FROM produtos WHERE status = 1 ORDER BY id DESC'
        );
        return rows;
    }

    async getById(id) {
        const [rows] = await this.db.execute(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
          );
          return rows;
    }

    async getProdAvByUser(id) {
        const [rows] = await this.db.execute(
            'SELECT * FROM produtos WHERE user_id = ? ORDER BY id DESC',
            [id]
        );
        return rows;
    }

    async getProductsFiltered(name, city, state, min, max) {
        
        let query = 'SELECT * FROM produtos WHERE status = 1 ORDER BY id DESC';
        const params = [];
        
        // Adicionar filtros conforme os parâmetros fornecidos
        if (name) {
            query += ' AND nome LIKE ?';
            params.push(`%${name}%`);
        }
        
        if (city) {
            query += ' AND city = ?';
            params.push(city);
        }
        
        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }
        
        if (min !== undefined && min !== null) {
            query += ' AND valor >= ?';
            params.push(min);
        }
        
        if (max !== undefined && max !== null) {
            query += ' AND valor <= ?';
            params.push(max);
        }
        
        // Executar a query
        const [rows] = await this.db.execute(query, params);
        
        return rows;
    }

    async create(prodData) {
        const { user_id, fotos, nome, tags, descricao, estado, valor, city, state } = prodData;
    
        const [result] = await this.db.execute(
          'INSERT INTO produtos(user_id, fotos, nome, tags, descricao, estado, valor, city, state, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [user_id, fotos, nome, tags, descricao, estado, valor, city, state]
        );
        
        return result;
    }
  
    async trocado(prod1, prod2){
        const [result] = await this.db.execute(
            'UPDATE produtos SET status = 0 WHERE id = ?',
            [prod1]
        );
        const [result2] = await this.db.execute(
            'UPDATE produtos SET status = 0 WHERE id = ?',
            [prod2]
        );

        return {result, result2};
    }
    
  }
  
  module.exports = Prod;