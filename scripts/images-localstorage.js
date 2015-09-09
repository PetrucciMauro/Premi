$('img').on(function(){
	var dest=$(this).attr('src');
	console.log("destinazione"+dest);
	var src=localStorage.getItem(dest);
	$(this).attr('src', src);
});

$('background').on(function(){
	var dest=$(this).attr('url');
	console.log("destinazione"+dest);
	var src=localStorage.getItem(dest);
	$(this).attr('url', src);
});