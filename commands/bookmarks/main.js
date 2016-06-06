webcli.commands.bookmarks = {};

webcli.commands.bookmarks.autocompletePath = function(path, onlyFolders, callback){
  webcli.commands.bookmarks.fuzzyFindByPath(path, function(pathMatch){

    var list = [];

    if(pathMatch.item !== null){
      var title = '';
      var bookmarkPath = '';
      if(pathMatch.path.parts.length - 1 == pathMatch.level + 1 && !pathMatch.path.isFolder){
        // is last part but not a folder
        var lastPart = pathMatch.path.parts[pathMatch.path.parts.length - 1];
        for (var i = 0; i < pathMatch.item.children.length; i++) {
          title = pathMatch.item.children[i].title;
          if(title.startsWith(lastPart) && (!onlyFolders || typeof pathMatch.item.children[i].children !== 'undefined')){
              list.push({title : title, replaceWith : pathMatch.itemPath + '/' + title});
          }
        }
      }
      else if(pathMatch.level >= pathMatch.path.parts.length - 1  && typeof pathMatch.item.children !== 'undefined' ){
        for (var j = 0; j < pathMatch.item.children.length; j++) {
          title = pathMatch.item.children[j].title;
          if(!onlyFolders || typeof pathMatch.item.children[j].children !== 'undefined'){
            list.push({title : title, replaceWith : pathMatch.itemPath + '/' + title});
          }
        }
      }
    }
    callback(list);
  });
};

webcli.commands.bookmarks.onAutocomplete = function (options, callback){
    var args = options.args;
    // suggest add, remove
    var commands = ['add', 'move', 'remove'];
    if(args.length === 0 || args[0]===''){
      return callback(webcli.autocomplete.createSuggestion(commands));
    }
    else if (args.length == 1) {
      return callback(webcli.autocomplete.compare(args[0], commands));
    }
    else if (args.length == 2 && (args[0]=='add' || args[0]=='remove')) {
        var onlyFolders = false;
        if(args[0]=='add'){
          onlyFolders = true;
        }
        webcli.commands.bookmarks.autocompletePath(args[1], onlyFolders, callback);
    }
    else if(args.length == 2 && args[0]=='move'){
      webcli.commands.bookmarks.autocompletePath(args[1], false, callback);
    }
    else if(args.length == 3 && args[0]=='move'){
      webcli.commands.bookmarks.autocompletePath(args[2], true, callback);
    }

};


webcli.commands.bookmarks.onDo = function(options, callback){
    var args = options.args;
    if(args.length === 0){
      return callback(null);
    }

    if(args[0] === 'add'){
      // add bookmark
      return webcli.commands.bookmarks.add(args[1], options.ui.tab.url, options.ui.tab.title, function(bookmark){

          // TODO: create a better notification
          browser.notifications.create({
            'type': 'basic',
            'title': 'Bookmark created',
            'message': 'Bookmark created'
          });
          callback({success : true, bookmark : bookmark});
      });
    }
    else if (args[0] === 'remove') {
      return webcli.commands.bookmarks.remove(args[1], function(response){
          if(response.success){
            // TODO: create a better notification
            browser.notifications.create({
              'type': 'basic',
              'title': 'Bookmark removed',
              'message': 'Bookmark removed'
            });
          }
          callback(response);
      });
    }
    else if (args[0] === 'move'){
      return webcli.commands.bookmarks.move(args[1], args[2], function(response){
          if(response.success){
            // TODO: create a better notification
            browser.notifications.create({
              'type': 'basic',
              'title': 'Bookmark moved',
              'message': 'Bookmark moved'
            });
          }
          callback(response);
      });
    }
};


webcli.commands.bookmarks.add = function(path, url, defaultTitle, callback){
   path = (typeof path !== 'undefined') ? path : '';
   var createRecursive = function(pathMatch, callback){
     var title = defaultTitle;
     var parent = pathMatch.item;
     if(parent === null){
       // could't find the root bookmark folder
       if(pathMatch.path.parts.length > 1 || pathMatch.path.isFolder){
         // we need the root folder
         return webcli.commands.bookmarks.createFolder(pathMatch.path.parts[0], null, function(folder){
           pathMatch.level = 0;
           pathMatch.item = folder;
           return createRecursive(pathMatch, callback);
         });
       }
       else {
         // we are creating a bookmark as root
         title = pathMatch.path.parts[0];
       }
     }
     else if(pathMatch.path.parts.length > pathMatch.level + 1){
       // couldn't find all path elements, let's create them
       var isLastItem = (pathMatch.path.parts.length == pathMatch.level + 2);
       if((isLastItem && pathMatch.path.isFolder) || !isLastItem){
         return webcli.commands.bookmarks.createFolder(pathMatch.path.parts[pathMatch.level + 1], parent, function(folder){
           pathMatch.level += 1;
           pathMatch.item = folder;
           return createRecursive(pathMatch, callback);
         });
       }
       else {
         title = pathMatch.path.parts[pathMatch.path.parts.length -1 ];
       }
     }
     return webcli.commands.bookmarks.createBookmark(title, parent, url, function(bookmark){
        return callback({bookmark: bookmark, pathMatch : pathMatch, path : path});
     });
   };

   webcli.commands.bookmarks.fuzzyFindByPath(path, function(pathMatch){
      return createRecursive(pathMatch, callback);
   });
};

webcli.commands.bookmarks.remove = function(path, callback){
  webcli.commands.bookmarks.fuzzyFindByPath(path, function(item){
     if(item.item !== null && item.isMatch){
       webcli.commands.bookmarks.removeBookmark(item.item, function(){
         callback({success : true});
       });
     }
     else {
       callback({success : false});
     }
  });
};

webcli.commands.bookmarks.createFoldersRecursive = function(pathMatch, callback){
  var currentPart = pathMatch.path.parts[pathMatch.level + 1];
  webcli.commands.bookmarks.createFolder(currentPart, pathMatch.item, function(folder){
      pathMatch.item = folder;
      pathMatch.level += 1;
      pathMatch.isMatch = (pathMatch.path.parts.length - 1 == pathMatch.level);
      if(!pathMatch.isMatch){
        // not ready, create more folder
        webcli.commands.bookmarks.createFoldersRecursive(pathMatch, callback);
      }
      else {
        callback(pathMatch);
      }
  });
};

webcli.commands.bookmarks.move = function(from, to, callback){
  webcli.commands.bookmarks.fuzzyFindByPath(from , function(fromPathMatch){
     if(fromPathMatch.item !== null && fromPathMatch.isMatch){
        var toPathObject = webcli.commands.bookmarks.parsePath(to);
        var folderPath = toPathObject.s;
        var newTitle = null;
        if(!toPathObject.isFolder){
            folderPath = toPathObject.parts.splice(0, toPathObject.parts.length - 1).join('/');
            newTitle = toPathObject.parts[toPathObject.parts.length - 1];
        }

        webcli.commands.bookmarks.fuzzyFindByPath(folderPath, function(toPathMatch){
          var onCreated = function(toPathMatch){
            browser.bookmarks.move(fromPathMatch.item.id, {parentId: toPathMatch.item.id});
            if(newTitle !== null){
              browser.bookmarks.update(fromPathMatch.item.id, {title:newTitle}, function(){
                callback({success:true});
              });
            }
            else {
              callback({success:true});
            }

          };

          if(toPathMatch.item !== null && toPathMatch.isMatch){
              onCreated(toPathMatch);
          }
          else {
            // create folder
            webcli.commands.bookmarks.createFoldersRecursive(toPathMatch, onCreated);
          }

        });
     }
     else {
       callback({success : false});
     }
  });
};


webcli.commands.bookmarks.createBookmark = function(title, parent, url, callback){
   var bookmark = {
      title : title
   };
   // if ommitted, creates under the root node
   if(parent !== null){
     bookmark.parentId = parent.id;
   }
   // if omitted create folder
   if(url !== null){
     bookmark.url = url;
   }
   return browser.bookmarks.create(bookmark, callback);
};



webcli.commands.bookmarks.createFolder = function(title, parent, callback){
  return webcli.commands.bookmarks.createBookmark(title, parent, null, callback);
};

webcli.commands.bookmarks.removeBookmark = function(bookmark, callback){
  var reponseCallback = function(){
      callback({success : true});
  };

  if(typeof bookmark.children !== 'undefined' && bookmark.children.length > 0){
    browser.bookmarks.removeTree(bookmark.id, reponseCallback);
  }
  else {
    browser.bookmarks.remove(bookmark.id, reponseCallback);
  }
};


webcli.commands.bookmarks.parsePath = function(path){
  var parts = path.split('/');
  var isFolder = path.endsWith('/');
  if(parts.length > 0 && parts[0] === ''){
    parts = parts.slice(1);
  }

  if(parts.length > 0 && parts[parts.length -1] === ''){
    parts = parts.slice(0, parts.length - 1);
  }
  return {s : path, parts: parts, isFolder : isFolder};
};


webcli.commands.bookmarks.fuzzyFindByPath = function(path, callback){
    var walker = function(list, pathParts, level, path){
        var item = null;
        var currentPathPart = pathParts[level];
        var response = {item : null, level : level, itemPath : ''};
        var currentPath = '';
        for (var i = 0; i < list.length; i++){
          item = list[i];
          currentPath = path + '/' + item.title;
          if(item.title == currentPathPart){
            if (pathParts.length == level + 1){
              // is last item from path
              return {item : item, level : level, itemPath : currentPath};
            }
            else if(typeof item.children !== 'undefined'){
              response = walker(item.children, pathParts, level + 1, currentPath);
              if(response.item !== null){
                return response;
              }
            }
            response = {item : item, level : level, itemPath : currentPath};
          }
        }
        return response;
    };
    var pathObject = webcli.commands.bookmarks.parsePath(path);
    var response = null;
    browser.bookmarks.getTree(function(list){
        // TODO: is this always list[0].children[2].children?
        var root = list[0].children[2];


        var pathMatch = {};
        pathMatch.item = root;
        pathMatch.level = -1;
        pathMatch.itemPath = '';

        if(typeof root.children !== 'undefined'){
          pathMatch = walker(root.children, pathObject.parts, 0, '');

          if(pathMatch.item === null){
            pathMatch.item = root;
            pathMatch.level = -1;
            pathMatch.itemPath = '';
          }
        }

        pathMatch.path = pathObject;
        pathMatch.isMatch = (pathMatch.path.parts.length - 1 == pathMatch.level);

        callback(pathMatch);
    });
};

webcli.autocomplete.commands.push('bookmarks');
webcli.autocomplete.event.on('bookmarks', webcli.commands.bookmarks.onAutocomplete);
webcli.action.doEvent.on('bookmarks', webcli.commands.bookmarks.onDo);
