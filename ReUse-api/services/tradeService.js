const Trade = require('../models/Trades');
const Prod = require('../models/Produtos');
const User = require('../models/User');
const db = require('../config/db');



const tradeModel = new Trade(db);
const prodModel = new Prod(db);
const userModel = new User(db);

class TradeService {

    async getAll(){
        const list = await tradeModel.getAll();
        return {
            list
        };
    }

    async getById(id){
        const list = await tradeModel.getById(id);
        return {
            list
        };
    }

    async create(user_id, product_id, offered_product_id, message) {
    
        const existingUser = await userModel.findById(user_id);
        if (!existingUser) {
          throw new Error('Usuario não existe');
        }

        const existingproduct = await prodModel.getById(product_id);
        if (!existingproduct) {
          throw new Error('Produto não existe');
        }

        const existingproduct2 = await prodModel.getById(offered_product_id);
        if (!existingproduct2) {
          throw new Error('Produto Oferecido não existe');
        }

        const trade = await tradeModel.create(user_id, product_id, offered_product_id, message);
    
        return {
          trade
        };
    }

    async cancel(id) {
      const trade = await tradeModel.cancel(id);
      return {
        trade
      };

    }

    async reject(id) {
      const trade = await tradeModel.reject(id);
      return {
        trade
      };
    }

    async accept(tradeid, user_id, rating) {
      const resRating = await userModel.addRating(tradeid, user_id, rating);
      const trade = await tradeModel.accept(tradeid);
      const [row] = await tradeModel.getProducts(tradeid);

      const trocados = await prodModel.trocado(row['prod1'], row['prod2']);
      return {
        trade,
        resRating,
        trocados
      };
    }

}

module.exports = TradeService;