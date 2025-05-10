class Trade {
    constructor(db) {
      this.db = db;
    }

    async getById(id) {
        const [rows] = await this.db.execute(
            'SELECT * FROM trades WHERE id = ?',
            [id]
        );
        return rows;
    }

    async getProducts(tradeId){
      const [rows] = await this.db.execute(
        `SELECT product_id as prod1, offered_product_id as prod2 FROM trades WHERE id = ?`,
        [tradeId]
      );
      return rows;
    }

    async getAll(){
        const [rows] = await this.db.execute(
            `SELECT
            t.id,
            t.user_id as user_sender,
            p1.user_id as user_reciver,
            t.message,
            t.status,
            t.created_at,
            t.updated_at,
            p1.id as id1,
            JSON_UNQUOTE(p1.fotos)as fotos1,
            p1.nome as nome1,
            p1.descricao as descricao1,
            p1.valor as valor1,
            p2.id as id2,
            JSON_UNQUOTE(p2.fotos) as fotos2,
            p2.nome as nome2,
            p2.descricao as descricao2,
            p2.valor as valor2
          FROM reuse_db.trades t
          JOIN reuse_db.produtos as p1 ON p1.id = t.product_id
          JOIN reuse_db.produtos as p2 ON p2.id = t.offered_product_id`);
        return rows;
    }

    async create(user_id, product_id, offered_product_id, message) {
    
        const [result] = await this.db.execute(
          'INSERT INTO trades(user_id, product_id, offered_product_id, message, status) VALUES (?, ?, ?, ?, 0)',
          [user_id, product_id, offered_product_id, message]
        );
        
        return result;
    }

    async cancel(id){
      const [result] = await this.db.execute(
        'UPDATE trades SET status = 3 WHERE id = ?',
        [id]);

        return result;
    }

    async reject(id){
      const [result] = await this.db.execute(
        'UPDATE trades SET status = 2 WHERE id = ?',
        [id]
      );

      return result;
    }

    async accept(id){
      const [result] = await this.db.execute(
        'UPDATE trades SET status = 1 WHERE id = ?',
        [id]
      );

      return result;
    }
  
    
  }
  
  module.exports = Trade;