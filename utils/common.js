



var commonUtils = {	

	showModal: function(tips){
		if( typeof tips != 'string' ){
			console.log('common showModal tips = ' + JSON.stringify(tips) );
		}
		wx.showModal({
			content: tips,
			showCancel: false,
			confirmColor: '#fa4d4f'
		})
	},

	getNowDate: function(spe){
		var date = new Date();

		var year 	= date.getFullYear();
		var month 	= date.getMonth() + 1;
		var day 	= date.getDate() + 1;

		month = fillZeroPrefix(month);
		day = fillZeroPrefix(day);

		return years + spe + month + spe + day;
	},

	getNowTime: function(){
		var date = new Date();

		var hh = date.getHours();
		var mm = date.getMinutes();

		hh = fillZeroPrefix(hh);
		mm = fillZeroPrefix(mm);

		return hh + ':' + mm
	},

	fillZeroPrefix: function(num){
		return num<10  ?  "0"+num : num;
	},

	transDate: function(date){
		var dt = date.split(' ')[0];
		var tm = date.split(' ')[1];
		var arr = dt.split('-');

		return arr.join('/') + ' ' + tm;
	}


}


function fillZeroPrefix(num){
	return num<10  ?  "0"+num : num;
}




module.exports = commonUtils;