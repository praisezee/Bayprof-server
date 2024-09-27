const { getUsersTransactions, updateTransaction } = require( "../../controller/admin/transactioncontroller" );

const router = require( "express" ).Router();


router.get( '/', getUsersTransactions );
router.put( '/:id', updateTransaction );

module.exports = router;