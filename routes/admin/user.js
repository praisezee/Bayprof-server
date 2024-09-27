const { getUsers, deleteUser, getSingleUser } = require( "../../controller/admin/userController" );

const router = require( "express" ).Router();

router.route( "/" )
      .get( getUsers )


router.route('/:id')
      .delete( deleteUser )
      .get( getSingleUser )
      
      
module.exports = router;