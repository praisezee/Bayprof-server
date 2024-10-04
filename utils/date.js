const addDays = ( days=4 ) =>
{
      const result = new Date( );
      result.setDate( result.getDate() + days );
      return result.toString();
};

const checkExpiration = ( currentDate, expiresDate ) =>
{
      if ( currentDate > expiresDate ) { return true; } else {
            return false;
      };
      
};

module.exports = {addDays,checkExpiration}