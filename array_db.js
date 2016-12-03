//GroupBy
var _Extend_ = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          out[key] = _Extend_(out[key], obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};
String.prototype.replaceAll = function(searchStr, replaceStr) {
	var str = this;

    // no match exists in string?
    if(str.indexOf(searchStr) === -1) {
        // return string
        return str;
    }

    // replace and remove first match, and do another recursirve search/replace
    return (str.replace(searchStr, replaceStr)).replaceAll(searchStr, replaceStr);
};
function UniqueID(pre) {
  return (pre ? pre : '_') + Math.random().toString(36).substr(2, 9);
};
String.prototype.GetCodeNumber = function(pos){
	var value = this;
	var n = value.length;
	if(n>pos){
		var number = '';
		for(var j=pos;j<n;j++){
			var c = ''+value.charCodeAt(j);
			switch(c.length){
				case 2:
					c = '0'+c;
					break;
				case 1:
					c = '00'+c;
					break;
			}
			number += c;
			if(number.length>=9){
				return {
					i : j+1,//next
					v : parseInt(number)
				};
				number = '';
			}
		}
		if(number!='')
			return {
				i : n,
				v : parseInt(number)
			};
	}
};
String.prototype.CompareByCode = function(value){
	var str = this;
	var ret = 0;
	var to_check = Math.min(value.length,str.length);
	var i=0;
	while(i<to_check){
		var a = str.GetCodeNumber(i);
		if(!a) return -1;
		var b = value.GetCodeNumber(i);
		if(!b) return 1;
		ret = a.v-b.v;
		if(ret!=0) return ret>0 ? 1 : -1;
		i = a.i;
	}
	return to_check>0 ? 0 : str.length==0 ? -1 : 1;
};

function ArrayDB(){
	this.MaxScoreLen = 32 ;
	this.ScoreTable = new Array(this.MaxScoreLen );
	for(var i=0;i<this.MaxScoreLen;i++)
		this.ScoreTable[i] = 1.0 / Math.pow(10,i);
}
ArrayDB.prototype.groupToPages = function (rows,itemsPerPage,filter) { 
	var pagedItems = [];
	var n = 0;
	for (var i = 0; i < rows.length; i++) {
		if(filter(rows[i])){
			var id = Math.floor(n++ / itemsPerPage);
			if (!pagedItems[id]) {
				pagedItems[id] = [ i ];
			} else {
				pagedItems[id].push(i);
			}
		}
	}
	return {
		currentPage : 0,
		pages : pagedItems,
		range : function (size) {
			var ret = [];        
			var e = this.pages.length-1;
			var s = size / 2;
			var start = this.currentPage - s;
			if(start<0) start = 0;
			var end = start + size;
			if(end>e) end = e;
			for (var i = start; i < end; i++) {
				ret.push({
					index : i,
					active : i == this.currentPage
				});
			}        
			 
			return ret;
		}
	}
};
ArrayDB.prototype.Group = function(Arr,columns,callback){
	var N = Arr.length;
	var set = {};
	var cols = columns.split(',');
	for(var i=0;i<N;i++){
		var item = Arr[i];
		var id = '';
		for(var j=0;j<cols.length;j++) id += item[cols[j]];
		
		if(!set[id]) set[id] = [];
		set[id].push(item);
	}
	if(callback){
		for(var id in set){
			callback(Arr,set,id);
		}
	}
	return set;
};
ArrayDB.prototype.Max = function(Arr,filter){
	var N = Arr.length;
	var obj = {
	};
	for(var i=0;i<N;i++){
		var item = Arr[i];
		for(var c in item){
			if(!filter || filter(c)){
				var v = parseFloat(item[c]);
				if(!isNaN(v)){
					if(obj[c]){
						if(obj[c]<v) obj[c] = v;
					}else 
						obj[c] = v;
				} 
			}
		}
	}
	return obj;
};
ArrayDB.prototype.Min = function(Arr,filter){
	var N = Arr.length;
	var obj = {
	};
	for(var i=0;i<N;i++){
		var item = Arr[i];
		for(var c in item){
			if(!filter || filter(c)){
				var v = parseFloat(item[c]);
				if(!isNaN(v)){
					if(obj[c]){
						if(obj[c]>v) obj[c] = v;
					}else 
						obj[c] = v;
				} 
			}
		}
	}
	return obj;
};

ArrayDB.prototype.GroupBy = function(A,conf,func,join){
	var s = conf.split(',');
	var set = [];
	for(var i=0;i<s.length;i++){
		var attr = s[i].split(' ');
		if(attr.length>0){
			set.push({
				field : attr[0]
			});
		}
	}
	//console.info('conf',conf);
	//console.info('set',conf);
	var N = A.length;
	var all = {};
	var order = [];
	for(var i=0;i<N;i++){
		var id = '';
		var row = A[i];
		for(var j=0;j<set.length;j++){
			id+=row[set[j].field];
		}
		if(!all[id]){
			order.push(id);
			all[id] = [];
		}
		all[id].push(func(row));
	}
	//console.info('all',all);
	var result = [];
	join = join || '<br>';
	for(var i=0;i<order.length;i++){
		result.push(all[order[i]].join(join));
	}
	return result;
}
ArrayDB.prototype.Join = function(A,B,func,outer){
	var min = Math.min(A.length,B.length);
	if(min==0) return [];
	var max = Math.max(A.length,B.length);
	var arr = [];
	var col = {
		A : {},
		B : {}
	};
	var id = 0;
	for(var i in A[0]) col.A[i] = {
		i : id++,
		n : 'A.'+i
	};
	for(var i in B[0]) col.B[i] = {
		i : id++,
		n : 'B.'+i
	};
	
	for(var i=A.length-1;i>=0;i--){
		var found = false;
		for(var j=B.length-1;j>=0;j--){
			found = func(A[i],B[j]);
			if(found){
				var item = A[i];
				for(var x in col.B) item[col.B[x].n] = B[j][x];
				arr.push(item);
			}
		}
		if(outer && !found){
			var item = A[i];
			for(var x in col.B) item[col.B[x].n] = null;
			arr.push(item);
		}
	}
	return arr;
}
ArrayDB.prototype.JoinRight = function(A,B,func,outer){
	return this.Join(B,A,func,outer);
}
ArrayDB.prototype.ScoreNumber = function(arr,item){
	var N = arr.length;
	for(var i=0;i<N;i++){
		item.score[i] = {
			i : i,
			v : parseFloat(arr[i][item.field])
		};					
	}
};
ArrayDB.prototype.ScoreCustom = function(arr,item,fn){
	var N = arr.length;
	for(var i=0;i<N;i++){
		item.score[i] = {
			i : i,
			v : fn(arr[i][item.field])
		};					
	}
};
ArrayDB.prototype.ScoreString = function(arr,item){
	var N = arr.length;
	var mm = [0,0];
	var nstr = [];
	var stb = this.ScoreTable;
	for(var i=0;i<N;i++){
		var value = ''+arr[i][item.field];
		var n = Math.min(this.MaxScoreLen,value.length);
		var codes = new Array(n);
		for(var j=0;j<n;j++){
			var c = value.charCodeAt(j);
			codes[j] = c;
			if(i==0 && j==0){
				mm[0] = c;
				mm[1] = c;
			}else{
				if(mm[0]>c) mm[0]=c;
				else if(mm[1]<c) mm[1]=c;
			}
		}
		nstr.push(codes);
	}
	var r = 1 + mm[1]-mm[0];
	for(var i=0;i<N;i++){
		var ns = nstr[i];
		var score = 0;
		for(var j=ns.length-1;j>=0;j--){
			ns[j] = (ns[j]-mm[0]) / r;
			score += ns[j]*stb[j];
		}
		item.score[i] = {
			i : i,
			v : score
		};	
	}			
};
ArrayDB.prototype.Sort = function(arr,conf,set){
	var that = this;
	set = set || {};
	//console.info('sort_order',conf);
	var s = conf.split(',');
	var sort_order = [];
	var N = arr.length;
	for(var i=0;i<s.length;i++){
		var attr = s[i].split(' ');
		if(attr.length>1){
			var item = {
				score : new Array(N),
				field : attr[0],
				order : attr[1]=='asc' ? -1 : 1,
				ftype : attr.length>2 ? attr[2] : 'string'
			};
			var dt = item.ftype.toLowerCase();
			if(set[dt])
				this.ScoreCustom(arr,item,set[dt]);
			else
				switch(item.ftype.toLowerCase()){
					case 'number':
						this.ScoreNumber(arr,item);
						break;
					case 'time':
						this.ScoreNumber(arr,item);
						break;
					default:
						item.score = null;// string
						break;
				}
			sort_order.push(item);
		}
	}
	
	var index = new Array(N);
	for(var i=0;i<N;i++){
		index[i] = {
			pos : i
		};
	}
	index.sort(function(a,b){
		for(var i=0;i<sort_order.length;i++){
			var item = sort_order[i];
			var s = 0;
			if(item.score){
				var sa = item.score[a.pos].v;
				var sb = item.score[b.pos].v;
				var d = sa - sb;
				s = d>0 ? 1 : d<0 ? -1 : 0;
			}else{
				s = arr[a.pos][item.field].localeCompare(arr[b.pos][item.field]);
			}
			if(s!=0){
				if(item.order * s>0){
					return -1;
				}else{
					return 1;
				}
			}
		}
		return 0;
	});
	var result = new Array(N);
	for(var i=0;i<index.length;i++)
		result[i] = arr[index[i].pos];
	return result;
}

 
ArrayDB.prototype.JoinI = function(A,B,func){
	var min = Math.min(A.length,B.length);
	if(min==0) return [];

	var arr = [];
		
	for(var i=A.length-1;i>=0;i--){
		var found = false;
		for(var j=B.length-1;j>=0;j--){
			found = func(A[i],B[j]);
			if(found){
				arr.push({
					a : i,
					b : j
				});
			}
		}
	}
	return arr;
}
/*
var A = [{name : '1',id : 2,p : 12},{name : '3',id : 3,p : null}]
var vjoin = ArrayDB.FindV(A,B,function(a,b){
	return a.id==2;
});
*/
ArrayDB.prototype.FindV = function(A,func){	
	var arr = [];
	
	if(!func)
		for(var i=A.length-1;i>=0;i--) arr.push(i);
	else
		for(var i=A.length-1;i>=0;i--) if(func(A[i]))	arr.push(i);

	return {
		rows : A,
		index : arr
	};
}
/*
var A = [{name : '1',id : 2,p : 12},{name : '3',id : 3,p : null}]
var B = [{title : '11',id : 12,p : 0},{title : '13',id : 13,p : 0}]

var a = ArrayDB.FindV(A);
var b = ArrayDB.FindV(B);

var conf = {
	A : a,
	B : b,
	filter : function(a,b){
		return a.p==b.id;
	},
	join :function(a,b){
		return {
			name : a.name,
			title : b ? b.title : null,
			id : a.id
		}
	},
	outer : false
};
var vjoin = ArrayDB.JoinFV(conf);
*/
ArrayDB.prototype.JoinFV = function(conf){
	var A = conf.a,B = conf.b,func = conf.filter,join = conf.join,outer = conf.outer;
	var min = Math.min(A.index.length,B.index.length);
	if(min==0) return [];

	var arr = [];
		
	for(var i=A.index.length-1;i>=0;i--){
		var found = false;
		var rowa = A.rows[A.index[i]];
		for(var j=B.index.length-1;j>=0;j--){
			var rowb = B.rows[B.index[j]];
			found = func(rowa,rowb);
			if(found){
				arr.push(join(rowa,rowb));
			}
		}
		if(outer && !found){
			arr.push(join(rowa,null));
		}
	}
	return arr;
}
/*
var conf = { 
	data : {
		'A' : [{name : '1',id : 2,p : 12},{name : '3',id : 3,p : null}],
		'B' : [{title : '11',id : 12,p : 0},{title : '13',id : 13,p : 0}],
		'C' : [{desc : '21',id : 2,p : 12},{desc : '23',id : 3,p : null}]
	},
	filter : [
		{
			a : 'A',
			b : 'B', 
			on : function(a,b) { return a.p==b.id; },
			join : function(a,b){
				return _Extend_({title : b.title},a);
			},
			outer : false
		},
		{
			a : null,
			b : 'C', 
			on : function(a,b) { return a.p==b.p; },
			join : function(a,b){ 
				return _Extend_({desc : b.desc},a);
			},
			outer : false
		}
	]
};
*/
ArrayDB.prototype.JoinV = function(A,B,item){
	var min = Math.min(A.length,B.length);
	if(min==0) return [];
	var func = item.on,join = item.join,outer = item.outer;
	var arr = [];
		
	for(var i=A.length-1;i>=0;i--){
		var found = false;
		for(var j=B.length-1;j>=0;j--){
			found = func(A[i],B[j]);
			if(found){
				arr.push(join(A[i],B[j]));
			}
		}
		if(outer && !found){
			arr.push(join(A[i],null));
		}
	}
	return arr;
}
ArrayDB.prototype.JoinEx = function(conf){
	for(var i=0;i<conf.filter.length;i++){
		var item = conf.filter[i];
		var A = item.a ? conf.data[item.a] : conf.filter[i-1].data;
		var B = item.b ? conf.data[item.b] : conf.filter[i-1].data;
		conf.filter[i].data = this.JoinV(A,B,item);
	}
	console.info('conf',conf);
	return conf.filter[conf.filter.length-1].data;
}
/*
var conf = { 
	data : {
		'A' : [{name : '1',id : 2,p : 12},{name : '3',id : 3,p : null}],
		'B' : [{title : '11',id : 12,p : 0},{title : '13',id : 13,p : 0}],
		'C' : [{desc : '21',name : '3'},{desc : '23',name : '1'}]
	},
	Select : function(item){
		console.info('item',item);
		return {
			
		};
	},
	filter : [
		{
			a : 'A',
			b : 'B', 
			on : function(data,a,b) {
				return data[a.buffer][a.index].p==data[b.buffer][b.index].id; 
			},
			join : function(a,b){
				return [a,b];
			},
			outer : false
		},
		{
			a : null,
			b : 'C', 
			on : function(data,a,b) { 
				if(!a.buffer){
					var items = data['$result$'][a.index];
					for(var i=0;i<items.length;i++){
						var o = items[i];
						if(data[o.buffer][o.index].name==data[b.buffer][b.index].name) return true;
					}
					return false;
				}					
				return data[a.buffer][a.index].name==data[b.buffer][b.index].name; 
			},
			join : function(a,b){
				return [a,b];
			},
			outer : false
		}
	]
};
*/
ArrayDB.prototype.JoinV2 = function(conf,A,B,item){
	var data = conf.data;
	var n = A ?  data[A].length : conf.$result$.length;
	var min = Math.min(n,data[B].length);
	if(min==0) return [];
	var func = item.on.bind(conf),outer = item.outer,join = item.join;//
	if(!join) {
		join = function(data,a,b){
			return [a,b];
		};
	}
	join = join.bind(conf);
	var arr = [];
	//console.info('start');

	var bn = data[B].length;
	for(var i=n-1;i>=0;i--){
		var found = false;
		var rowa = {
			buffer : A,
			index : i
		};
		for(var j=bn-1;j>=0;j--){
			var rowb = {
				buffer : B,
				index : j
			};
			found = func(data,rowa,rowb);
			
			//console.warn('check',i,conf.$result$,found,rowa,rowb);
			if(found){
				if(!A){
					var item = conf.$result$[i];
					var aa = [];
					//console.warn('item',item);
					for(var h=0;h<item.length;h++){
						aa.push(item[h]);
					}
					aa.push(rowb);
					//console.warn('aa',aa);
					arr.push(aa);
				}
				else
					arr.push(join(data,rowa,rowb));
			}
		}
		if(outer && !found){
			if(!A){
				var item = conf.$result$[i];
				var aa = [];
				//console.warn('item',item);
				for(var h=0;h<item.length;h++){
					aa.push(item[h]);
				}
				aa.push(null);
				arr.push(aa);
			}
			else
				arr.push(join(data,rowa,null));
		}
	}
	//console.info('end');
	
	return arr;
}
ArrayDB.prototype.JoinEx2 = function(conf){
	conf.$result$ = [];
	for(var i=0;i<conf.filter.length;i++){
		var item = conf.filter[i];
		conf.$result$ = this.JoinV2(conf,item.a,item.b,item);
	}
	var Select = conf.Select.bind(conf);
	//console.info('conf',conf);
	var arr = [];
	
	for(var i=0;i<conf.$result$.length;i++){
		var item = conf.$result$[i];
		var set = {};
		
		for(var j=0;j<item.length;j++){
			var v = item[j];
			
			set[v.buffer] = conf.data[v.buffer][v.index];
		}
		arr.push(Select(set));
	}
	return arr;
}
