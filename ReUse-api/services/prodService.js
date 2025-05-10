const Prod = require('../models/Produtos');
const User = require('../models/User');
const db = require('../config/db');



const prodModel = new Prod(db);
const userModel = new User(db);

class ProdService {

    async list(){
        const list = await prodModel.getProductsAvalible();
        return {
            list
        };
    }

    async create(prodData) {
        const { user_id, fotos, nome, tags, descricao, estado, valor, city, state, status } = prodData;
        
        // Verificar se o usuário existe
        const existingUser = await userModel.findById(user_id);
        if (!existingUser) {
          throw new Error('Usuario não existe');
        }
    
        const prod = await prodModel.create({user_id, fotos, nome, tags, descricao, estado, valor, city, state, status});
    
        return {
          prod
        };
    }

    async prod(id) {
        const rows = await prodModel.getById(id);
        var prod = rows[0]; // Se espera apenas um produto
        const rating = await userModel.getRating(prod.user_id);
        prod.avaliacao = rating.average_rating;
        return { prod }
    }

    async getProdAvByUser(id){
        const rows = await prodModel.getProdAvByUser(id);
        return {rows};
    }


}

module.exports = ProdService;