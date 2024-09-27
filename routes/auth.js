const { createUser, loginUser } = require( "../controller/authController" );

const router = require( "express" ).Router();

router.post( '/register', createUser );
router.post( "/login", loginUser );

module.exports = router;