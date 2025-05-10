const TradeService = require('../services/tradeService');

class TradeController {
    constructor() {
        this.tradeService = new TradeService();
    }

    async createTradeProposal(req, res) {
        try {
            const { user_id, product_id, offered_product_id, message} = req.body;

            if ( !user_id || !product_id || !offered_product_id) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Todos os campos obrigatórios devem ser preenchidos' 
                });
            }

            const result = await this.tradeService.create(user_id, product_id, offered_product_id, message? message : null);

            res.status(201).json({
                success: true,
                trade: result.create,
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message || 'Erro no servidor' 
            });
        }
    }

    async getAll(req, res) {
        try{
            const result = await this.tradeService.getAll();
            
            res.status(201).json({
                success: true,
                trades: result,
            });
        }catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message || 'Erro no servidor' 
            });
        }
    }

    async cancelTrade(req,res){
        try{
            const { tradeid } = req.body;

            if(!tradeid){
                return res.status(400).json({
                    success: false,
                    message: 'O tradeid é obrigatório'
                });
            }


            const result = await this.tradeService.cancel(tradeid);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }catch (error) {
             res.status(500).json({
                success: false,
                message: error.message || 'Erro no servidor'
            });
        }
    }

    async rejectTrade(req,res){
        try{
            const { tradeid } = req.body;

            if(!tradeid){
                return res.status(400).json({
                    success: false,
                    message: 'O tradeid é obrigatório'
                });
            }


            const result = await this.tradeService.reject(tradeid);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }catch (error) {
             res.status(500).json({
                success: false,
                message: error.message || 'Erro no servidor'
            });
        }
    }

    async acceptTrade(req, res){
        try{
            const { tradeid, rating, userid } = req.body;

            if(!tradeid || !rating || !userid){
                return res.status(400).json({
                    success: false,
                    message: 'O tradeid e rating é obrigatório'
                });
            }

            await this.tradeService.accept(tradeid, userid, rating);

            res.status(200).json({
                success: true,
            });

        }catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Erro no servidor'
            });
        }
    }
}

module.exports = TradeController;