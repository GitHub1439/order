

const formatTime = date => {
	const year  = date.getFullYear()
	const month = date.getMonth() + 1;
	const day   = date.getDate();
	const hour  = date.getHours();
	const minute= date.getMinutes();
	const second= date.getSeconds();

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

const cardnoAddSpace = cardno => {
    var ncard='';
	if( cardno ){
	    for(var n=0;n<cardno.length;n=n+4){
	        ncard += cardno.substring(n,n+4)+" ";
	    }
	}
	return ncard;
}

const accMul = (arg1, arg2)=> { 
	var m=0;
	var s1=arg1.toString();
	var s2=arg2.toString(); 
	try{ m+=s1.split(".")[1].length }catch(e){} 
	try{ m+=s2.split(".")[1].length }catch(e){} 
	return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
}

module.exports = {
  	formatTime: formatTime,
  	cardnoAddSpace: cardnoAddSpace,
  	accMul: accMul
}
