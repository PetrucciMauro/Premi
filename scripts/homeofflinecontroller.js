var manifest = (function() {
	var offlineIndex = (function() {
		var indexKey = 'offline-index',
			index;

		function getIndex() {
			if (index) {
				return index;
			}

			var indexStr = localStorage.getItem( indexKey );
			index = ( indexStr ? JSON.parse( indexStr ) : {} );
			return index;
		}

		function setIndex(index) {
			var json = JSON.stringify( index );
			localStorage.setItem( indexKey, json );
		}

		return {
			add: function(pathname, title) {
				var index = getIndex();
				index[pathname] = title;
				setIndex( index );
			},
			remove: function(pathname) {
				var index = getIndex();
				delete index[pathname];
				setIndex( index );
			},
			getTitle: function(pathname) {
				return getIndex()[pathname];
			},
			isIndexed: function(pathname) {
				return pathname in getIndex();
			},
			getKeys: function() {
				return Object.keys( getIndex() );
			},
			clear: function() {
				setIndex( {} );
			}
		};
	})();

	var getOfflineIndex = function(){
		var objects=JSON.parse(localStorage.getItem("offline-Index"));
	}


	return{
	funzione: function(){console.log("funzione");},
	salvaManifest: function(title,json){
		translatorManifest.example();
		var html = translatorManifest.translateManifest(title, json);
		console.log(html);
		console.log("Save SlideShow");
		var pathname = title;
		content = html;
		offlineIndex.add(pathname);
		localStorage.setItem( pathname, content);
		},
		deleteManifest: function(title) {
			localStorage.removeItem(title);
			offlineIndex.remove(title);
		},
		makePage: function(){
		//ti ricavi le presentaz. salvate
			var ss = document.getElementById("slideshows");
			offlineIndex.getKeys().forEach( function(key) {
				console.log( key );
				var div = document.createElement("P");
				var textnode=document.createTextNode(key);
				div.appendChild(textnode);
				var button=document.createElement("BUTTON");
				button.setAttribute("onclick", "location.href='offlineexecution.html?pres="+key+"';"); //'execution-offline.html?pres="'+key+'"'
				var label=document.createTextNode("Visualizza Presentazione");
				button.appendChild(label);
				div.appendChild(button);
				// var del=document.createElement("BUTTON");
				// del.setAttribute("onclick", function(){deleteManifest(key);});
				// label=document.createTextNode("Elimina");
				// del.appendChild(label);
				// div.appendChild(del);
				ss.appendChild(div);
				var clt= document.createElement("BR");
				ss.appendChild(clt);
			});
		},
		renderCurrentPage: function(title) {
			var content;
			if ( offlineIndex.isIndexed(title) ) {
				content = localStorage.getItem( title );
			}
			else {
				content = 'Page not available :(';
			}
			return content;
		},

	// 	// 	// We don't add scripts with a src, they're already there
	// 	// 	$body.empty().append(
	// 	// 		$( content ).filter( ':not(script[src])' )
	// 	// 	);
	// 	// 	document.title = title;
	// 	// },
	// 	// snapshotPage: function() {
	// 	// 	snapshot = document.body.innerHTML;
	// 	// },
		clearAll: function() {
			offlineIndex.getKeys().forEach( function(key) {
				localStorage.removeItem( key );
			});
			offlineIndex.clear();
		}
	};
})();
