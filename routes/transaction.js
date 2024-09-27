const { depositTransaction, getTransaction, withdraw } = require( "../controller/userTransactionController" );

const router = require( "express" ).Router();

router.get('/',getTransaction)
router.post( "/deposit", depositTransaction )
router.post("/withdraw", withdraw)


module.exports = router