const { PrismaClient, Prisma } = require( "@prisma/client" );
const { sendErrorResponse, sendSuccessResponse } = require( "../../utils/responseHelper" );

const prisma = new PrismaClient();

const getUsers = async ( req, res ) =>
{
      try {
            const user = await prisma.user.findMany();
            return sendSuccessResponse( res,200,"successful",{user} );
      } catch (error) {
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
};

const getSingleUser = async ( req, res ) =>
{
      try {
            const { id } = req.params;
            const user = await prisma.user.findUniqueOrThrow( {
                  where:{id},
            } )
            return sendSuccessResponse( res, 200, "successful", { user } );
      }  catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return sendErrorResponse(res,404,"user does not exist")
            }
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};

const deleteUser = async ( req, res ) =>
{
      try {
            const { id } = req.params;
            const user = await prisma.user.delete( {
                  where:{id},
            } )
            return sendSuccessResponse( res, 200, "successful", { user } );
      }  catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return sendErrorResponse(res,404,"user does not exist")
            }
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};


module.exports = {getUsers, getSingleUser, deleteUser}