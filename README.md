# arraydb
Sort or Join by multiple object properties of Javascript array.

Usage :
```
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
	
  // group rows to pages,each page contain 20 rows,custom filter function
  pages = db.groupToPages(rows,20/* items per page*/,function(row){ return true; }/* filter function */);
  /*
  pages will be :
  {
	currentPage : 0,
	pages : pagedItems,
	range : function (size) {..} // allow to define pagination range
}
  */
  // result will have row fields grouped by custom function
  var g = db.GroupBy(
  	rows,
  	cols.join(',')/* object properties to group by*/,
  	get_title/*merge properties function */,
  	'<br>'/*grouped items divider*/);
  	
  /*
  for example :
    g = db.GroupBy([{name:'Item1',id:1},{name:'Item2',id:1},{name:'Item_1',id:2},{name:'Item_2',id:2}],'id',
    	function(row){
    	  return row.name.toLowerCase();
    	},
    	'<br>'
    );
    g will contain :
    [
     'item1<br>item2',
     'item_1<br>item_2'
    ]
  */
```

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
