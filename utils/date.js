const addDays = ( date, days=4 ) =>
{
      const result = new Date( date );
      result.setDate( result.getDate() + days );
      return result;
};

const checkExpiration = ( currentDate, expiresDate ) =>
{
      if ( currentDate > expiresDate ) { return true; } else {
            return false;
      };
      
}