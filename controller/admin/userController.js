const { sendErrorResponse, sendSuccessResponse } = require( "../../utils/responseHelper" );
const User = require( "../../model/User" );
const Transaction = require( "../../model/Transaction" );

const getUsers = async ( req, res ) =>
{
      try {
            const usersinit = await User.find()
            const usersDemo = usersinit.map( async ( { _id, _doc, ...rest } ) =>
            {
                  const transactionsInit = await Transaction.find( { user_id: _id } );
                  const transactions = transactionsInit.map( ( { _id, _doc, ...rest } ) => ( {
                        id: _id,
                        ..._doc
                  } ) )
                  const data = {
                        
                              id: _id,
                              ..._doc,
                              transactions
                  }
                  return data;
            } )
            const users = await Promise.all( usersDemo );
            console.log(users);
            return sendSuccessResponse( res,200,"successful",{users} );
      } catch (error) {
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
};

const getSingleUser = async ( req, res ) =>
{
      try {
            const { id } = req.params;
            const user = await User.findOne( { _id: id } )
            const transactionsInit = await Transaction.find( { user_id: id } ); 
            const transactions = transactionsInit.map( ( { _id, _doc, ...rest } ) => ( {
                        id: _id,
                        ..._doc
                  } ) )
            if ( !user ) return sendErrorResponse( res, 404, "User does not exist" );
            delete user.password
            delete user.refresh_token
            return sendSuccessResponse( res, 200, "successful", { user:{...user._doc,id:user._id,transactions} } );
      }  catch (e) {
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};

const deleteUser = async ( req, res ) =>
{
      try {
            const { id } = req.params;
            await Transaction.deleteMany({user_id:id})
            const user = await User.delete( { _id: id } );
            return sendSuccessResponse( res, 200, "successful", { user } );
      }  catch (e) {
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};


module.exports = {getUsers, getSingleUser, deleteUser}