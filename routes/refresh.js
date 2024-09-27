const { refresh } = require( "../controller/refreshController" );

const router = require( "express" ).Router();

router.get( '/', refresh );

module.exports=router