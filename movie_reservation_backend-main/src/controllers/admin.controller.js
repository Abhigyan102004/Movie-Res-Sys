const adminService = require('../services/admin.service');

async function getStats(req,res,next){
    try{
        const stats = await adminService.getDashboardStats(req.query);
        res.json({
            success:true,data:stats
        });
    }catch (err){
        next(err);
    }
}

module.exports = {getStats};