const { forgetPassword, resetPassword } = require( "../controller/pasword" );

const router = require( "express" ).Router();


router.get( '/forget', forgetPassword );
router.post('/reset',resetPassword)

module.exports=router