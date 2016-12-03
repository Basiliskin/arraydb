# arraydb
Sort or Join by multiple object properties of Javascript array.

Usage :
  * create arraydb instance .
  var db = new ArrayDB();
  
  * join two arrays
  var join = db.Join(testA,testB,function(a,b){
			return a.value==b.value;
	});
	
	* sort array by multiple object properties ,custom 'date' property handler function.
	* order format :
	* object property + [space]+[asc/desc]+[type,optional]
	* default types string and number
	* date is custom property type contor,which convert date to number.
	db.Sort(join,'title asc,date desc date,value desc number',{
			'date' : function(value){
				return value.getTime();
			}
	})
  
This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
