const userService = require('../services/user.service');  
  
  async function getProfile(req,res,next){
    try{
      const userId = req.user.id;
      const userProfile = await userService.getUserProfile(userId);
      res.status(200).json({
        success:true,
        data:userProfile,
      })
    }
    catch(err){
      next(err);
    }
  }

  async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
}


  async function getReservations(req,res,next){
    try{
      const userId=req.user.id;
      const reservationsData = await userService.getUserReservations(userId);
      res.status(200).json({
        success:true,
        data:reservationsData,
      });
    }
    catch(err){
      next(err);
    }
  }

  async function updatePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        await userService.changePassword(userId, oldPassword, newPassword);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
}

async function deleteAccount(req, res, next) {
    try {
        const userId = req.user.id;
        await userService.deleteUserAccount(userId);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
}

  
  
  module.exports = { getProfile,getReservations,updateProfile,updatePassword,deleteAccount };